package com.example.ControledeMerenda.service

import com.example.ControledeMerenda.model.Comida
import com.example.ControledeMerenda.model.EventoMerenda
import com.example.ControledeMerenda.model.EventoMerendaRequest
import com.example.ControledeMerenda.repository.ComidaRepository
import com.example.ControledeMerenda.repository.EventosMerendaRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class EventosMerendaService(
    private val eventosMerendaRepository: EventosMerendaRepository,
    private val comidaRepository: ComidaRepository // Repositório para buscar a comida
) {

    // Método para salvar evento
    fun salvarEvento(request: EventoMerendaRequest): EventoMerenda {
        // Busca a comida associada ao ID fornecido no request
        val comida: Comida = comidaRepository.findById(request.comidaId)
            .orElseThrow { IllegalArgumentException("Comida com ID ${request.comidaId} não encontrada.") }

        // Criação do objeto EventoMerenda com base no request
        val eventoMerenda = EventoMerenda(
            data = request.data,
            turno = request.turno,
            comida = comida,
            horarioInicio = request.horarioInicio
        )

        // Salva o evento no banco de dados
        return eventosMerendaRepository.save(eventoMerenda)
    }

    // Método para obter o último evento
    fun obterUltimoEvento(): EventoMerenda? {
        return eventosMerendaRepository.findTopByOrderByIdDesc()  // Retorna o último evento registrado
    }

    // Método para obter o ID do evento em andamento (sem horário de fim)
    fun obterEventoEmAndamentoId(): Long? {
        val eventoEmAndamento = eventosMerendaRepository.findFirstByHorarioFimIsNull()  // Retorna o evento sem horário de fim
        return eventoEmAndamento?.id  // Retorna apenas o ID
    }

    // Método para atualizar o horário de término do evento
    fun atualizarHorarioFim(id: Long, horarioFim: LocalDateTime): EventoMerenda? {
        // Busca o evento pelo ID, lança uma exceção caso não encontre
        val evento = eventosMerendaRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Evento com ID $id não encontrado.") }

        // Atualiza o horário de fim
        evento.horarioFim = horarioFim

        // Salva o evento atualizado no banco de dados
        return eventosMerendaRepository.save(evento)
    }
}
