package com.example.ControledeMerenda.model

import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonValue
import jakarta.persistence.*
import java.time.LocalDateTime


@Entity
@Table(name = "controle_merendas")
data class ControleMerenda(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne
    @JoinColumn(name = "evento_id", nullable = false)
    val evento: EventoMerenda, // Alterado para EventoMerenda

    @ManyToOne
    @JoinColumn(name = "aluno_id")
    val aluno: Aluno, // Alterado para Aluno

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    val status: StatusMerenda,

    val quantidade: Int,

    val horarioRegistro: LocalDateTime,

    val observacao: String
)

enum class StatusMerenda {
        PENDENTE,
        APROVADO, // Verifique se isso está aqui no enum
        REJEITADO;
    @JsonValue
    fun toValue(): String {
        return this.name
    }

    companion object {
        @JsonCreator
        fun fromString(value: String): StatusMerenda {
            for (status in entries) {
                if (status.name.equals(value, ignoreCase = true)) {
                    return status
                }
            }
            throw IllegalArgumentException("Invalid status value: $value")
        }
    }
}

data class MerendaRequest(
    val alunoId: Long,
    val eventoId: Long,
    val status: String,
    val quantidade: Int,
    val horarioRegistro: LocalDateTime? = null,
    val observacao: String
)
