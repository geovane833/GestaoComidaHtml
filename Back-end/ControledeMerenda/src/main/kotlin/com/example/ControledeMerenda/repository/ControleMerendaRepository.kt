package com.example.ControledeMerenda.repository

import com.example.ControledeMerenda.model.ControleMerenda
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDateTime


@Repository
interface ControleMerendaRepository : JpaRepository<ControleMerenda?, Long?> {

    fun existsByAlunoIdAndEventoId(alunoId: Long, eventoId: Long): Boolean

    fun findByHorarioRegistroBetween(start: LocalDateTime?, end: LocalDateTime?): List<ControleMerenda?>?
}
