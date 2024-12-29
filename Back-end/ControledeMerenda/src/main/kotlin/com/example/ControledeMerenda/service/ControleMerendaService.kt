package com.example.ControledeMerenda.service

import com.example.ControledeMerenda.model.ControleMerenda
import com.example.ControledeMerenda.model.EventoMerenda
import com.example.ControledeMerenda.model.StatusMerenda
import com.example.ControledeMerenda.repository.ControleMerendaRepository
import com.example.ControledeMerenda.repository.EventosMerendaRepository
import com.example.ControledeMerenda.repository.AlunoRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.temporal.ChronoUnit
import java.util.Base64

@Service
    class ControleMerendaService(
        @Autowired private val controleMerendaRepository: ControleMerendaRepository,
        @Autowired private val eventosMerendaRepository: EventosMerendaRepository,
        @Autowired private val alunoRepository: AlunoRepository
    ) {

    fun registrarMerenda(alunoId: Long, status: StatusMerenda): ResponseEntity<String> {
        return try {
            // Obtém o evento atual em andamento
            val eventoAtual = obterEventoAtual()

            // Verifica se o aluno já foi registrado para o evento
            val alunoRegistrado = controleMerendaRepository.existsByAlunoIdAndEventoId(alunoId, eventoAtual.id)
            if (alunoRegistrado) {
                return ResponseEntity("Aluno já registrado para o evento", HttpStatus.BAD_REQUEST)
            }

            // Busca o aluno pelo ID
            val aluno = alunoRepository.findById(alunoId)
                .orElseThrow { IllegalStateException("Aluno não encontrado com ID: $alunoId") }

            // Define a observação com base no status
            val observacao = if (status == StatusMerenda.PENDENTE) {
                "Aluno NÃO recebeu a merenda"
            } else {
                "Aluno recebeu a merenda"
            }

            // Atribui o horário atual como LocalDateTime e trunca para segundos
            val horarioRegistro = LocalDateTime.now().truncatedTo(ChronoUnit.SECONDS)  // Trunca para segundos

            // Define a quantidade com base no status
            val quantidadeMerenda = if (status == StatusMerenda.PENDENTE) 0 else 1

            // Cria o objeto ControleMerenda para salvar no banco de dados
            val controleMerenda = ControleMerenda(
                evento = eventoAtual,                  // Evento atual
                aluno = aluno,                          // Aluno
                status = status,                        // Status da merenda
                quantidade = quantidadeMerenda,         // Quantidade de merenda, 0 se pendente
                horarioRegistro = horarioRegistro,     // Hora atual como LocalDateTime
                observacao = observacao                // Observação baseada no status
            )

            // Salva a merenda registrada no banco de dados
            controleMerendaRepository.save(controleMerenda)

            // Retorna sucesso com a mensagem
            ResponseEntity("Merenda registrada com sucesso", HttpStatus.OK)
        } catch (e: Exception) {
            // Caso haja um erro, retornar a mensagem de erro
            ResponseEntity("Erro ao registrar merenda: ${e.message}", HttpStatus.BAD_REQUEST)
        }
    }
    fun obterEventoAtual(): EventoMerenda {
        // Recupera o último evento registrado
        val evento = eventosMerendaRepository.findTopByOrderByIdDesc()
            ?: throw IllegalStateException("Nenhum evento encontrado.")

        // Verifica se o evento já foi finalizado
        if (evento.horarioFim != null) {
            throw IllegalStateException("Não há eventos em andamento.")
        }

        // Retorna o evento atual em andamento
        return evento
    }

    fun listarHistoricoPorData(dia: Int, mes: Int, ano: Int): List<ControleMerenda?> {
        println("Buscando histórico para a data: $dia/$mes/$ano")

        // Define o início do dia (00:00:00)
        val dataInicio = LocalDateTime.of(ano, mes, dia, 0, 0, 0, 0)

        // Define o fim do dia (23:59:59)
        val dataFim = dataInicio.plusDays(1).minusNanos(1) // Isso pega o último momento do dia

        // Adiciona log para verificar o intervalo de datas
        println("Intervalo de busca: $dataInicio a $dataFim")

        // Faz a consulta no repositório com o intervalo de datas
        val historico = controleMerendaRepository.findByHorarioRegistroBetween(dataInicio, dataFim)

        // Log para ver quantos registros foram encontrados
        println("Registros encontrados: ${historico?.size ?: 0}")

        // Retorna todos os eventos sem agrupar
        return historico ?: emptyList() // Caso não encontre nada, retorna uma lista vazia
    }

    fun redimensionarImagem(imagem: ByteArray, largura: Int, altura: Int): ByteArray? {
        try {
            val inputImage = javax.imageio.ImageIO.read(imagem.inputStream())
            val imagemRedimensionada: java.awt.Image = inputImage.getScaledInstance(largura, altura, java.awt.Image.SCALE_SMOOTH)

            val imagemBuffered = java.awt.image.BufferedImage(largura, altura, java.awt.image.BufferedImage.TYPE_INT_ARGB)
            val g = imagemBuffered.createGraphics()
            g.drawImage(imagemRedimensionada, 0, 0, null)
            g.dispose()

            val baos = java.io.ByteArrayOutputStream()
            javax.imageio.ImageIO.write(imagemBuffered, "png", baos)
            baos.flush()

            return baos.toByteArray()
        } catch (e: Exception) {
            e.printStackTrace()
            return null
        }
    }

}