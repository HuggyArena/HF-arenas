import { Injectable, Logger } from '@nestjs/common';

export type SanctionsScreeningResult = {
  address: string;
  risk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'SEVERE';
  categories: string[];
  entities: string[];
};

@Injectable()
export class SanctionsProvider {
  private readonly logger = new Logger(SanctionsProvider.name);
  private readonly provider = (process.env.SANCTIONS_PROVIDER || 'TRM') as 'TRM' | 'CHAINALYSIS';
  private readonly apiKey = process.env.TRM_API_KEY || process.env.CHAINALYSIS_API_KEY || '';
  private readonly baseUrl =
    this.provider === 'TRM' ? 'https://api.trmlabs.com/public/v1' : 'https://api.chainalysis.com/api/v1';

  get providerName() {
    return this.provider;
  }

  async screenAddress(address: string): Promise<SanctionsScreeningResult> {
    return this.provider === 'TRM' ? this.screenTRM(address) : this.screenChainalysis(address);
  }

  async batchScreen(addresses: string[]) {
    if (this.provider === 'TRM') {
      return this.batchScreenTRM(addresses);
    }
    return Promise.all(addresses.map((a) => this.screenAddress(a)));
  }

  private async batchScreenTRM(addresses: string[]): Promise<SanctionsScreeningResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/screening/addresses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addresses.map((address) => ({ address, network: 'polygon' }))),
      });
      const data: any[] = await response.json();
      // Build a lookup map keyed by the address returned in each response item so
      // that the final array order matches the input regardless of API response order.
      const resultMap = new Map<string, SanctionsScreeningResult>();
      for (const item of data) {
        const addr: string = (item?.address ?? '').toLowerCase();
        if (addr) {
          resultMap.set(addr, {
            address: addr,
            risk: item?.riskScore > 70 ? 'HIGH' : item?.riskScore > 30 ? 'MEDIUM' : 'NONE',
            categories: item?.flags?.map((f: any) => f.type) || [],
            entities: item?.identifiedEntities || [],
          });
        }
      }
      return addresses.map((address) => {
        const key = address.toLowerCase();
        return (
          resultMap.get(key) ?? {
            address,
            risk: 'HIGH',
            categories: ['SCREENING_ERROR'],
            entities: [],
          }
        );
      });
    } catch (error) {
      this.logger.error('TRM batch screening failed', error as any);
      return addresses.map((address) => ({ address, risk: 'HIGH', categories: ['SCREENING_ERROR'], entities: [] }));
    }
  }

  private async screenTRM(address: string): Promise<SanctionsScreeningResult> {
    try {
      const response = await fetch(`${this.baseUrl}/screening/addresses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, network: 'polygon' }),
      });
      const data: any = await response.json();
      return {
        address,
        risk: data?.riskScore > 70 ? 'HIGH' : data?.riskScore > 30 ? 'MEDIUM' : 'NONE',
        categories: data?.flags?.map((f: any) => f.type) || [],
        entities: data?.identifiedEntities || [],
      };
    } catch (error) {
      this.logger.error(`TRM screening failed for ${address}`, error as any);
      return { address, risk: 'HIGH', categories: ['SCREENING_ERROR'], entities: [] };
    }
  }

  private async screenChainalysis(address: string): Promise<SanctionsScreeningResult> {
    try {
      const response = await fetch(`${this.baseUrl}/sanctions/screening`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      const data: any = await response.json();
      return {
        address,
        risk: data?.sanctions?.length ? 'SEVERE' : 'NONE',
        categories: data?.identifications?.map((i: any) => i.category) || [],
        entities: data?.identifications?.map((i: any) => i.entity) || [],
      };
    } catch (error) {
      this.logger.error(`Chainalysis screening failed for ${address}`, error as any);
      return { address, risk: 'HIGH', categories: ['SCREENING_ERROR'], entities: [] };
    }
  }
}
