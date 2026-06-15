export const crearEstilosGlobales = (colores: any) => ({
  contenedorPantalla: {
    flex: 1,
    backgroundColor: colores.fondoPrincipal,
  },
  textoTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colores.textoPrincipal,
    marginBottom: 20,
  },
});
