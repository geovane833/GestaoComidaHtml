package com.example.ControledeMerenda.model

import jakarta.persistence.*

@Entity
@Table(name = "alunos")
data class Aluno(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    val curso: String,
    val imagem: ByteArray? = null, // Armazenar imagem em formato binário
    val matricula: String,
    val nome: String,
    val turno: String
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Aluno) return false

        if (id != other.id) return false
        if (nome != other.nome) return false
        if (matricula != other.matricula) return false
        if (curso != other.curso) return false
        if (turno != other.turno) return false
        if (imagem != null) {
            if (other.imagem == null) return false
            if (!imagem.contentEquals(other.imagem)) return false
        } else if (other.imagem != null) return false

        return true
    }
    override fun hashCode(): Int {
        var result = id.hashCode()
        result = 31 * result + nome.hashCode()
        result = 31 * result + matricula.hashCode()
        result = 31 * result + curso.hashCode()
        result = 31 * result + turno.hashCode()
        result = 31 * result + (imagem?.contentHashCode() ?: 0)
        return result
    }
}
