import Link from "next/link";
import { ArrowRight, ChatCircleText, MagnifyingGlass, UsersThree } from "@phosphor-icons/react/dist/ssr";

const githubIssueUrl = "https://github.com/DDev1822/Conflictos_Mineros/issues/new";

export function ContactBand() {
  return (
    <section className="contact-band" aria-labelledby="contact-band-heading">
      <div className="contact-band-intro">
        <p className="eyebrow">Contacto y colaboración</p>
        <h2 id="contact-band-heading">¿Quieres aportar evidencia, señalar algo o sumarte al equipo?</h2>
        <p>
          El observatorio mejora con fuentes trazables, correcciones precisas y revisión colectiva. Cada aporte debe separar
          hecho, interpretación y propuesta, idealmente con fuente, ubicación exacta y fecha de consulta.
        </p>
      </div>
      <div className="contact-band-actions">
        <article>
          <MagnifyingGlass size={24} />
          <h3>Aportar una fuente</h3>
          <p>Envía documento, enlace, página o sección exacta y qué afirmación sostiene, matiza o contradice.</p>
          <Link href="/metodologia#correcciones">Ver reglas de corrección <ArrowRight size={16} /></Link>
        </article>
        <article>
          <ChatCircleText size={24} />
          <h3>Señalar un error</h3>
          <p>Indica página, texto observado, fuente de contraste y cambio sugerido.</p>
          <a href={`${githubIssueUrl}?title=Correccion%20documental%3A%20&labels=documentacion`}>Enviar corrección <ArrowRight size={16} /></a>
        </article>
        <article>
          <UsersThree size={24} />
          <h3>Sumarse al equipo</h3>
          <p>Hay espacio para revisión documental, datos, cartografía, diseño y lectura territorial.</p>
          <a href={`${githubIssueUrl}?title=Colaboracion%3A%20&labels=colaboracion`}>Proponer colaboración <ArrowRight size={16} /></a>
        </article>
      </div>
    </section>
  );
}
