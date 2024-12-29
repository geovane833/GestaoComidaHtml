package com.example.ControledeMerenda.model

import jakarta.persistence.*

@Entity
@Table(name = "comidas")
data class Comida(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    val nome: String,
    val imagem: ByteArray? = null // Armazenar imagem em formato binário
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Comida) return false

        if (id != other.id) return false
        if (nome != other.nome) return false
        if (imagem != null) {
            if (other.imagem == null) return false
            if (!imagem.contentEquals(other.imagem)) return false
        } else if (other.imagem != null) return false

        return true
    }

    override fun hashCode(): Int {
        var result = id.hashCode()
        result = 31 * result + nome.hashCode()
        result = 31 * result + (imagem?.contentHashCode() ?: 0)
        return result
    }
}
