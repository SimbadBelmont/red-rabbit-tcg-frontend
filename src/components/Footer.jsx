import { Link } from 'react-router-dom';
import logo from '../assets/logo-completo.png';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="contenedor footer__fila">
                <span className="footer__marca"><img src={logo} alt="Red Rabbit TCG Store" />© {new Date().getFullYear()} Red Rabbit TCG Store · Cuernavaca, Morelos</span>
                <span className="footer__enlaces">
                    <Link to="/contacto">Contacto</Link>
                    <a href="#instagram">Instagram</a>
                    <a href="#facebook">Facebook</a>
                </span>
            </div>
            <p className="contenedor footer__legal">
                Datos e imágenes de cartas de Magic: The Gathering vía <a href="https://scryfall.com">Scryfall</a>.
                Magic: The Gathering es propiedad de Wizards of the Coast. Este sitio no está afiliado ni respaldado por Wizards of the Coast.
            </p>
        </footer>
    );
}
