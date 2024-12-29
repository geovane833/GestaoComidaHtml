package com.example.ControledeMerenda.controller

import com.example.ControledeMerenda.model.*
import com.example.ControledeMerenda.service.AlunoService
import com.example.ControledeMerenda.service.ControleMerendaService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*
import java.util.Base64
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/controle-merendas")
class ControleMerendaController(
    @Autowired private val controleMerendaService: ControleMerendaService,
    @Autowired private val alunoService: AlunoService
) {

    @PostMapping("/registrar")
    fun registrarMerenda(@RequestBody merendaRequest: MerendaRequest): ResponseEntity<Any> {
        return try {
            // Validação de status
            val statusString = merendaRequest.status?: throw IllegalArgumentException("Status da merenda não informado.")

            // Converte o status de String para StatusMerenda
            val status = try {
                StatusMerenda.valueOf(statusString.toUpperCase()) // Converte para enum
            } catch (e: IllegalArgumentException) {
                throw IllegalArgumentException("Status inválido: $statusString. Valores válidos são: PENDENTE, ENTREGUE.")
            }

            // Extrai os outros dados da requisição
            val alunoId = merendaRequest.alunoId

            // Chama o serviço para registrar a merenda
            controleMerendaService.registrarMerenda(alunoId, status)

            // Resposta de sucesso
            ResponseEntity.ok(mapOf("message" to "Merenda registrada com sucesso!", "status" to "success"))

        } catch (e: Exception) {
            // Resposta de erro
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(mapOf("message" to "Erro: ${e.message}", "status" to "error"))
        }
    }

    @GetMapping("/listarAlunos")
    fun listarAlunos(@RequestParam eventoId: Long): ResponseEntity<List<Map<String, Any>>> {
        val alunos = alunoService.listarAlunosDisponiveis(eventoId)

        val alunosComImagens = alunos.map { aluno ->
            mapOf<String, Any>(
                "id" to (aluno.id ?: 0),
                "nome" to aluno.nome,
                "matricula" to aluno.matricula,
                "curso" to aluno.curso,
                "turno" to aluno.turno,
                "imagem" to (aluno.imagem?.let { Base64.getEncoder().encodeToString(it) } ?: "")
            )
        }

        return ResponseEntity.ok(alunosComImagens)
    }

    @GetMapping("/alunos-disponiveis/{eventoId}")
    fun listarAlunosDisponiveis(@PathVariable eventoId: Long): ResponseEntity<List<Aluno>> {
        val alunos = alunoService.listarAlunosDisponiveis(eventoId)
        return ResponseEntity.ok(alunos)
    }


    @RestController
    @RequestMapping("/historico")
    class HistoricoController(private val controleMerendaService: ControleMerendaService) {

        @GetMapping("/data")
        fun listarHistoricoPorData(
            @RequestParam("dia") dia: Int,
            @RequestParam("mes") mes: Int,
            @RequestParam("ano") ano: Int
        ): ResponseEntity<List<Map<String, Any>>> {
            val historico = controleMerendaService.listarHistoricoPorData(dia, mes, ano)

            // Aqui, vamos filtrar os itens nulos primeiro e então mapear os valores não nulos
            val historicoFormatado = historico.filterNotNull().map { item ->

                // Verifica se o status é "PENDENTE" ou a quantidade é 0
                val comidaMap = if (item.status.name == "PENDENTE" || item.quantidade == 0) {
                    // Se a condição for atendida, não carrega a comida
                    mapOf<String, Any>(
                        "nome" to "",
                        "imagem" to ""
                    )
                } else {
                    // Caso contrário, carrega normalmente
                    mapOf<String, Any>(
                        "nome" to (item.evento.comida?.nome ?: "Comida não disponível"),
                        "imagem" to (item.evento.comida?.imagem?.let { imagem ->
                            val imagemMenor = controleMerendaService.redimensionarImagem(imagem, 100, 100)
                            imagemMenor?.let { Base64.getEncoder().encodeToString(imagemMenor) } ?: ""
                        } ?: "")
                    )
                }

                // Mapeamento de outros campos
                mapOf<String, Any>(
                    "id" to (item.id ?: 0L),
                    "aluno" to item.aluno.nome,
                    "matricula" to item.aluno.matricula,
                    "curso" to item.aluno.curso,
                    "turno" to item.aluno.turno,
                    "status" to item.status.name,
                    "quantidade" to item.quantidade,
                    "horario" to item.horarioRegistro.toString(),
                    "observacao" to (item.observacao ?: ""),
                    "imagem" to (item.aluno.imagem?.let {
                        val imagemMenor = controleMerendaService.redimensionarImagem(it, 100, 100)
                        imagemMenor?.let { Base64.getEncoder().encodeToString(imagemMenor) }
                    } ?: ""),
                    "comida" to comidaMap
                )
            }

            return ResponseEntity.ok(historicoFormatado)
        }
    }

}
