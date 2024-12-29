package com.example.ControledeMerenda.repository

import com.example.ControledeMerenda.model.EventoMerenda
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface EventosMerendaRepository : JpaRepository<EventoMerenda, Long> {

    // Método para buscar o último evento
    fun findTopByOrderByIdDesc(): EventoMerenda?

    // Método para buscar o evento em andamento (sem horário de fim)
    fun findFirstByHorarioFimIsNull(): EventoMerenda?

}