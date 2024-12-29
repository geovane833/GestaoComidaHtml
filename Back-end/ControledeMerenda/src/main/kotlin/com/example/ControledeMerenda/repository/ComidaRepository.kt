package com.example.ControledeMerenda.repository

import com.example.ControledeMerenda.model.Comida
import org.springframework.data.jpa.repository.JpaRepository

interface ComidaRepository : JpaRepository<Comida, Long> {
    fun findByNomeContainingIgnoreCase(nome: String): List<Comida>
    fun existsByNome(nome: String): Boolean
}
