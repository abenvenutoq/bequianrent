'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">bequianrent documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AdminEstadisticaVenta.html" data-type="entity-link" >AdminEstadisticaVenta</a>
                            </li>
                            <li class="link">
                                <a href="components/AdminPanel.html" data-type="entity-link" >AdminPanel</a>
                            </li>
                            <li class="link">
                                <a href="components/App.html" data-type="entity-link" >App</a>
                            </li>
                            <li class="link">
                                <a href="components/EditarReserva.html" data-type="entity-link" >EditarReserva</a>
                            </li>
                            <li class="link">
                                <a href="components/Footer.html" data-type="entity-link" >Footer</a>
                            </li>
                            <li class="link">
                                <a href="components/Home.html" data-type="entity-link" >Home</a>
                            </li>
                            <li class="link">
                                <a href="components/Login.html" data-type="entity-link" >Login</a>
                            </li>
                            <li class="link">
                                <a href="components/MiPerfil.html" data-type="entity-link" >MiPerfil</a>
                            </li>
                            <li class="link">
                                <a href="components/MisReservas.html" data-type="entity-link" >MisReservas</a>
                            </li>
                            <li class="link">
                                <a href="components/Navbar.html" data-type="entity-link" >Navbar</a>
                            </li>
                            <li class="link">
                                <a href="components/Registro.html" data-type="entity-link" >Registro</a>
                            </li>
                            <li class="link">
                                <a href="components/ReservarAuto.html" data-type="entity-link" >ReservarAuto</a>
                            </li>
                            <li class="link">
                                <a href="components/ReservasTablaComponent.html" data-type="entity-link" >ReservasTablaComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/Sucursal.html" data-type="entity-link" >Sucursal</a>
                            </li>
                            <li class="link">
                                <a href="components/Testimonio.html" data-type="entity-link" >Testimonio</a>
                            </li>
                            <li class="link">
                                <a href="components/UsuariosTablaComponent.html" data-type="entity-link" >UsuariosTablaComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VehiculosTablaComponent.html" data-type="entity-link" >VehiculosTablaComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/VerAutos.html" data-type="entity-link" >VerAutos</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EstadisticaService.html" data-type="entity-link" >EstadisticaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/IndicadoresEconomicos.html" data-type="entity-link" >IndicadoresEconomicos</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReservaService.html" data-type="entity-link" >ReservaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SucursalesService.html" data-type="entity-link" >SucursalesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TestimoniosService.html" data-type="entity-link" >TestimoniosService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ValidacionService.html" data-type="entity-link" >ValidacionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/VehiculoService.html" data-type="entity-link" >VehiculoService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ArriendosMensuales.html" data-type="entity-link" >ArriendosMensuales</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IndicadorEconomico.html" data-type="entity-link" >IndicadorEconomico</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MensajeVista.html" data-type="entity-link" >MensajeVista</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Reserva.html" data-type="entity-link" >Reserva</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReservaDetalle.html" data-type="entity-link" >ReservaDetalle</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ResultadoOperacion.html" data-type="entity-link" >ResultadoOperacion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SerieIndicador.html" data-type="entity-link" >SerieIndicador</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Sesion.html" data-type="entity-link" >Sesion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Sucursales.html" data-type="entity-link" >Sucursales</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Testimonios.html" data-type="entity-link" >Testimonios</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Usuario.html" data-type="entity-link" >Usuario</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Vehiculo.html" data-type="entity-link" >Vehiculo</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});