package com.example.ControledeMerenda.controller

import com.example.ControledeMerenda.model.EventoMerenda
import com.example.ControledeMerenda.model.EventoMerendaRequest
import com.example.ControledeMerenda.repository.EventosMerendaRepository
import com.example.ControledeMerenda.service.EventosMerendaService
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@RestController
@RequestMapping("/api/eventos-merenda")
class EventosMerendaController(
    private val eventosMerendaService: EventosMerendaService,
    private val repository: EventosMerendaRepository
) {
    private val logger = LoggerFactory.getLogger(EventosMerendaController::class.java)

    @PostMapping
    fun criarEventoMerenda(@RequestBody eventoMerendaRequest: EventoMerendaRequest): ResponseEntity<Any> {
        return try {
            logger.info("Recebendo evento de merenda para salvar: $eventoMerendaRequest")
            validarEvento(eventoMerendaRequest)
            val eventoSalvo = eventosMerendaService.salvarEvento(eventoMerendaRequest)
            ResponseEntity.status(HttpStatus.CREATED).body(eventoSalvo)
        } catch (e: IllegalArgumentException) {
            logger.error("Erro de validação: ${e.message}")
            ResponseEntity.status(HttpStatus.BAD_REQUEST).body(mapOf("error" to e.message))
        } catch (e: Exception) {
            logger.error("Erro ao salvar evento de merenda: ${e.message}", e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("error" to "Erro interno do servidor"))
        }
    }

    @GetMapping("/ultimo")
    fun obterUltimoEvento(): ResponseEntity<EventoMerenda> {
        return try {
            val evento = eventosMerendaService.obterUltimoEvento()
            evento?.let { ResponseEntity.ok(it) }
                ?: ResponseEntity.status(HttpStatus.NOT_FOUND).build()
        } catch (e: Exception) {
            logger.error("Erro ao obter último evento de merenda: ${e.message}", e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }
    }

    @GetMapping("/evento-em-andamento-id")
    fun obterEventoEmAndamentoId(): ResponseEntity<Map<String, Any?>> {
        return try {
            val id = eventosMerendaService.obterEventoEmAndamentoId()
            id?.let { ResponseEntity.ok(mapOf("id" to it)) }
                ?: ResponseEntity.status(HttpStatus.NOT_FOUND).body(mapOf("error" to "Nenhum evento em andamento"))
        } catch (e: Exception) {
            logger.error("Erro ao obter ID do evento em andamento: ${e.message}", e)
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(mapOf("error" to "Erro interno do servidor"))
        }
    }

    @PutMapping("/{id}/atualizar-horario-fim")
    fun atualizarHorarioFim(
        @PathVariable id: Long,
        @RequestBody horarioFimRequest: Map<String, String>
    ): ResponseEntity<Any> {
        return try {
            val horarioFimString = horarioFimRequest["horario_fim"]
                ?: return ResponseEntity.badRequest().body(mapOf("error" to "O campo 'horario_fim' é obrigatório."))

            // Tentativa de parse com diferentes formatos
            val horarioFim = try {
                LocalDateTime.parse(horarioFimString, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
            } catch (e1: Exception) {
                try {
                    LocalDateTime.parse(horarioFimString) // ISO 8601
                } catch (e2: Exception) {
                    return ResponseEntity.badRequest().body(
                        mapOf("error" to "Formato inválido para o horário de fim. Formatos aceitos: 'yyyy-MM-dd HH:mm:ss' ou ISO 8601.")
                    )
                }
            }

            // Buscar o evento e atualizar
            val evento = repository.findById(id).orElse(null)
                ?: return ResponseEntity.notFound().build()

            evento.horarioFim = horarioFim
            repository.save(evento)
            ResponseEntity.ok(evento)

        } catch (e: Exception) {
            ResponseEntity.status(500).body(mapOf("error" to "Erro interno do servidor: ${e.message}"))
        }
    }


    private fun validarEvento(request: EventoMerendaRequest) {
        require(!request.data.toString().isBlank()) { "A data do evento é obrigatória." }
        require(!request.turno.isBlank()) { "O turno do evento é obrigatório." }
        require(request.horarioInicio.toString().isNotBlank()) { "O horário de início é obrigatório." }
        require(request.comidaId > 0) { "O ID da comida associada ao evento é obrigatório." }
    }
}
