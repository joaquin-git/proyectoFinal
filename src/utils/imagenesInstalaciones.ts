export const IMAGENES_INSTALACIONES: Record<string, string> = {
  'Pádel Sport Granada Indoor': 'https://www.padelnest.com/pictures/pic/U6/U6NW/U6NWJWRO3V_x.jpg',
  'CD Núñez Blanca (Zaidín)': 'https://www.ahoragranada.com/wp-content/uploads/2015/07/Complejo-deportivo-Nu%C3%B1ez-blanca-Zaidin-03.jpg',
  'Estadio de la Juventud': 'https://www.ahoragranada.com/wp-content/uploads/2023/03/presentacion-de-las-nuevas-instalaciones-del-Estadio-de-la-Juventud-AC-2.jpg',
  'Real Sociedad de Tenis': 'https://res.cloudinary.com/dzsrcaaas/image/upload/w_1200,c_fill,f_auto,q_auto/v1770926046/badgie/directory/49e256d5-5eac-4b59-8a63-d05fe55b7488/hero.jpg',
  'Campus Tenis & Pádel (PTS)': 'https://campuspadelclub.es/wp-content/uploads/2021/04/111.jpg',
  'CD Inacua Antonio Prieto': 'https://assets-cdn.wellhub.com/images/?su=https%3A%2F%2Fimages.partners.gympass.com%2Fimage%2Fpartners%2Fd59db2c6-f956-49b3-9a19-688658eb8d06%2Flg_48d2b979-eb4a-4a58-bc42-0e220a080fce_276599.png&h=360',
  'Complejo Deportivo Chana': 'https://www.pmdgranada.es/comun/galerias/INS-CHANA/ICH-lg-01.jpg',
  'We Fitness Club': 'https://palco23.mundodeportivo.com/files/0002017/000redaccion/fitness/we%20granada/we%20granada%20728.jpg',
  'Pádel Villa de Otura': 'https://www.padelnest.com/pictures/pic/R6/R6XM/R6XM3INS1E_x.jpg',
  'Bola de Oro': 'https://i.ytimg.com/vi/IEdhbNEqgSE/maxresdefault.jpg',
};

export const DEFAULT_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Padel_court.jpg/800px-Padel_court.jpg';

export const getImagenInstalacion = (nombre: string): string => {
  return IMAGENES_INSTALACIONES[nombre] || DEFAULT_IMAGE;
};
