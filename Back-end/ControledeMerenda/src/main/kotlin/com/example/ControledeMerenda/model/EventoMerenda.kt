package com.example.ControledeMerenda.model

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "eventos_merenda")
data class EventoMerenda(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    val data: LocalDate,

    val turno: String,

    @ManyToOne
    @JoinColumn(name = "comida_id", referencedColumnName = "id") // Estabelecendo o relacionamento com a Comida
    val comida: Comida,

    @Column(name = "horario_inicio")
    val horarioInicio: LocalDateTime,

    @Column(name = "horario_fim")
    var horarioFim: LocalDateTime? = null
)

data class EventoMerendaRequest(
    val data: LocalDate,
    val turno: String,
    val comidaId: Long,
    val horarioInicio: LocalDateTime
)
