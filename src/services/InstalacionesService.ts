import { getInstalaciones } from '../../servicios/api';

export class InstalacionesService {
  async fetchInstalaciones(): Promise<any[]> {
    return await getInstalaciones();
  }
}
