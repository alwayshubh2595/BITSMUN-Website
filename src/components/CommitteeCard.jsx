import React from "react";
import styles from "../styles/CommitteeCard.module.scss";

// Rebuilt as a self-contained grid card. The previous version was a full-width
// row (100vw x 45vh) whose description panel animated open sideways from 0% to
// 60% width — that forced one committee per screen row and clipped any agenda
// longer than the fixed height allowed. The 2026 agendas are long sentences, so
// nothing is fixed-height here and all text wraps.

const CommitteeCard = (props) => {
  const isPress = props.name === "IP";

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {props.img ? (
          <img src={props.img} alt={props.alt || props.name} loading="lazy" />
        ) : (
          <div className={styles.mediaFallback} aria-hidden="true" />
        )}
        {props.type && <span className={styles.modeTag}>{props.type}</span>}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{props.name}</h3>
        {props.fullname && <p className={styles.fullname}>{props.fullname}</p>}

        <dl className={styles.meta}>
          {/* A crisis committee is defined by its freeze date, not an agenda —
              CCC US NSC will never have one, so showing "Agenda: To be
              announced" there promises something that is not coming. Only fall
              back to "To be announced" for committees that should have one. */}
          {(props.agenda || !props.freezeDate) && (
            <div>
              <dt>{isPress ? "Roles" : "Agenda"}</dt>
              <dd>{props.agenda ? props.agenda : "To be announced"}</dd>
            </div>
          )}

          {props.freezeDate && (
            <div>
              <dt>Freeze date</dt>
              <dd>{props.freezeDate}</dd>
            </div>
          )}

          {props.delegateStrength && (
            <div>
              <dt>Delegate strength</dt>
              <dd>{props.delegateStrength}</dd>
            </div>
          )}

          {props.chair && (
            <div>
              <dt>Chairperson</dt>
              <dd>{props.chair}</dd>
            </div>
          )}

          {props.viceChair && (
            <div>
              <dt>Vice Chairperson</dt>
              <dd>{props.viceChair}</dd>
            </div>
          )}
        </dl>
      </div>
    </article>
  );
};

export default CommitteeCard;
