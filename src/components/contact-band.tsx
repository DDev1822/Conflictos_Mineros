import { ArrowRight, ChatCircleText, MagnifyingGlass, UsersThree } from "@phosphor-icons/react/dist/ssr";

const githubIssueUrl = "https://github.com/DDev1822/Conflictos_Mineros/issues/new";

export function ContactBand() {
  return (
    <section className="contact-band" aria-labelledby="contact-band-heading">
      <div className="contact-band-intro">
        <p className="eyebrow">Participa en el observatorio</p>
        <h2 id="contact-band-heading">¿Tienes datos, conoces un caso o quieres colaborar?</h2>
        <p>
          Buscamos aportes de comunidades, investigadores, periodistas, organizaciones, instituciones y especialistas para
          ampliar los datos territoriales, corregir errores y desarrollar nuevos análisis.
        </p>
      </div>
      <div className="contact-band-actions">
        <article>
          <MagnifyingGlass size={24} />
          <h3>Compartir datos</h3>
          <p>Envía bases, mapas, reportes, estudios o información territorial que ayude a completar un caso o tema.</p>
          <a href={`${githubIssueUrl}?title=Aporte%20de%20datos%3A%20&labels=documentacion`}>Proponer un aporte <ArrowRight size={16} /></a>
        </article>
        <article>
          <ChatCircleText size={24} />
          <h3>Señalar un error</h3>
          <p>Indica la página, el dato que debe corregirse y la referencia pública que permita revisarlo.</p>
          <a href={`${githubIssueUrl}?title=Correccion%3A%20&labels=documentacion`}>Enviar corrección <ArrowRight size={16} /></a>
        </article>
        <article>
          <UsersThree size={24} />
          <h3>Sumarse al equipo</h3>
          <p>Hay espacio para investigación, datos, cartografía, diseño, desarrollo y lectura territorial.</p>
          <a href={`${githubIssueUrl}?title=Colaboracion%3A%20&labels=colaboracion`}>Proponer colaboración <ArrowRight size={16} /></a>
        </article>
      </div>
    </section>
  );
}
