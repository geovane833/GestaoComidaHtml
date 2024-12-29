package com.example.ControledeMerenda.controller

import com.example.ControledeMerenda.service.ComidaService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.util.Base64

@RestController
@RequestMapping("/comidas")
class ComidaController(private val comidaService: ComidaService) {

    @PostMapping("/cadastro")
    fun cadastrarComida(
        @RequestParam nome: String,
        @RequestParam(required = false) imagem: MultipartFile?
    ): ResponseEntity<String> {
        return try {
            if (nome.isBlank()) {
                return ResponseEntity.badRequest().body("O nome da comida não pode ser vazio.")
            }
            val imagemBytes = imagem?.bytes
            comidaService.cadastrarComida(nome, imagemBytes)
            ResponseEntity.ok("Comida cadastrada com sucesso!")
        } catch (e: Exception) {
            ResponseEntity.badRequest().body("Erro ao cadastrar comida: ${e.message}")
        }
    }

    @GetMapping("/listar")
    fun listarComidas(): ResponseEntity<List<Map<String, Any>>> {
        val comidas = comidaService.listarComidas()

        // Mapeia as comidas para incluir a imagem codificada em Base64
        val comidasComImagens = comidas.map { comida ->
            mapOf<String, Any>(
                "id" to (comida.id ?: 0),
                "nome" to comida.nome,
                "imagem" to (comida.imagem?.let { Base64.getEncoder().encodeToString(it) } ?: "")
            )
        }

        return ResponseEntity.ok(comidasComImagens)
    }

    @GetMapping("/{id}")
    fun buscarComidaPorId(@PathVariable id: Long): ResponseEntity<Any> {
        val comida = comidaService.buscarComidaPorId(id)
        return if (comida != null) {
            val comidaComImagem = mapOf<String, Any>(
                "id" to (comida.id ?: 0), // Usando 0 se o id for null
                "nome" to comida.nome,
                "imagem" to (comida.imagem?.let { Base64.getEncoder().encodeToString(it) } ?: "")
            )
            ResponseEntity.ok(comidaComImagem)
        } else {
            ResponseEntity.status(404).body("Comida com ID $id não encontrada.")
        }
    }

    @GetMapping("/buscar")
    fun buscarComida(
        @RequestParam(required = false) nome: String?
    ): ResponseEntity<Any> {
        return if (nome != null && nome.isNotBlank()) {
            ResponseEntity.ok(comidaService.buscarPorNomeContendo(nome))
        } else {
            ResponseEntity.badRequest().body("Parâmetro de busca não fornecido ou inválido")
        }
    }

    @PutMapping("/editar/{id}")
    fun editarComida(
        @PathVariable id: Long,
        @RequestParam nome: String,
        @RequestParam(required = false) imagem: MultipartFile?, // Recebe a nova imagem
        @RequestParam(required = false) imagemRemovida: Boolean? // Flag de remoção
    ): ResponseEntity<String> {
        return try {
            // Buscar a comida existente no banco
            val comidaExistente = comidaService.buscarComidaPorId(id)

            // Verificar se a comida foi encontrada
            if (comidaExistente == null) {
                return ResponseEntity.status(404).body("Comida com ID $id não encontrada.")
            }

            // Verificar se a imagem foi removida ou se uma nova imagem foi fornecida
            val imagemBytes = if (imagemRemovida == true) {
                null // Se imagemRemovida for true, removemos a imagem
            } else {
                imagem?.bytes ?: comidaExistente.imagem // Se a imagem não foi removida, usamos a nova ou mantemos a antiga
            }

            // Atualizar a comida com as novas informações
            comidaService.editarComida(id, nome, imagemBytes)

            // Retornar sucesso
            ResponseEntity.ok("Comida atualizada com sucesso!")
        } catch (e: Exception) {
            // Em caso de erro, retornar resposta de erro
            ResponseEntity.badRequest().body("Erro ao atualizar comida: ${e.message}")
        }
    }

    @DeleteMapping("/excluir/{id}")
    fun excluirComida(@PathVariable id: Long): ResponseEntity<String> {
        return try {
            // Verifica se a comida existe
            val comidaExistente = comidaService.buscarComidaPorId(id)

            if (comidaExistente == null) {
                // Caso não exista, retorna erro 404
                return ResponseEntity.status(404).body("Comida com ID $id não encontrada.")
            }
            // Exclui a comida
            comidaService.excluirComida(id)
            // Resposta de sucesso
            ResponseEntity.ok("Comida excluída com sucesso!")
        } catch (e: Exception) {
            // Caso ocorra algum erro, retorna um erro 400
            ResponseEntity.badRequest().body("Erro ao excluir comida: ${e.message}")
        }
    }

}
