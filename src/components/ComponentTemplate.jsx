import React from 'react'
import styles from './ComponentTemplate.module.css'

export default function ComponentTemplate({ title = 'Component' }) {
  return (
    <section className={styles.wrap}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.subtitle}>This is a reusable component template.</p>
    </section>
  )
}
