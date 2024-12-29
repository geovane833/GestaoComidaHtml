package com.example.ControledeMerenda.repository

import com.example.ControledeMerenda.model.Aluno
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface AlunoRepository : JpaRepository<Aluno, Long> {

    // Método para buscar por nome que contenha a substring, sem diferenciar maiúsculas e minúsculas
    fun findByNomeContainingIgnoreCase(nome: String): List<Aluno>

    // Método para buscar por matrícula que contenha a substring, sem diferenciar maiúsculas e minúsculas
    fun findByMatriculaContainingIgnoreCase(matricula: String): List<Aluno>

    fun existsByMatricula(matricula: String): Boolean

    @Query("SELECT a FROM Aluno a WHERE NOT EXISTS (" +
            "SELECT 1 FROM ControleMerenda cm WHERE cm.aluno.id = a.id AND cm.evento.id = :eventoId)")
    fun findAlunosNaoRegistradosNoEvento(@Param("eventoId") eventoId: Long): List<Aluno>
}

