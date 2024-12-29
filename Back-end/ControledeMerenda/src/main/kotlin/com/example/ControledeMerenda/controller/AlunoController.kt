package com.example.ControledeMerenda.controller

import com.example.ControledeMerenda.service.AlunoService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.util.Base64


@RestController
@RequestMapping("/alunos")
class AlunoController(private val alunoService: AlunoService) {

    @PostMapping("/cadastro")
    fun cadastrarAluno(
        @RequestParam nome: String,
        @RequestParam matricula: String,
        @RequestParam curso: String,
        @RequestParam turno: String,
        @RequestParam(required = false) imagem: MultipartFile?
    ): ResponseEntity<String> {
        return try {
            // Verifica se a matrícula já existe
            if (alunoService.matriculaExiste(matricula)) {
                return ResponseEntity.badRequest().body("Matrícula já cadastrada!")
            }

            val imagemBytes = imagem?.bytes
            alunoService.cadastrarAluno(nome, matricula, curso, turno, imagemBytes)
            ResponseEntity.ok("Aluno cadastrado com sucesso!")
        } catch (e: Exception) {
            ResponseEntity.badRequest().body("Erro ao cadastrar aluno: ${e.message}")
        }
    }

    @GetMapping("/listar")
    fun listarAlunos(): ResponseEntity<List<Map<String, Any>>> {
        val alunos = alunoService.listarAlunos()

        val alunosComImagens = alunos.map { aluno ->
            mapOf<String, Any>(
                "id" to (aluno.id ?: 0), // Garantimos que o valor seja do tipo Long (ou outro tipo compatível com Any)
                "nome" to aluno.nome,
                "matricula" to aluno.matricula,
                "curso" to aluno.curso,
                "turno" to aluno.turno,
                "imagem" to (aluno.imagem?.let { Base64.getEncoder().encodeToString(it) } ?: "") // Retorna string vazia caso a imagem seja nula
            )
        }

        return ResponseEntity.ok(alunosComImagens)
    }

    @GetMapping("/buscar")
    fun buscarAluno(
        @RequestParam(required = false) nome: String?,
        @RequestParam(required = false) matricula: String?
    ): ResponseEntity<Any> {
        return when {
            nome != null -> ResponseEntity.ok(alunoService.buscarPorNomeContendo(nome))
            matricula != null -> ResponseEntity.ok(alunoService.buscarPorMatriculaContendo(matricula))
            else -> ResponseEntity.badRequest().body("Parâmetro de busca não fornecido")
        }
    }

    @PutMapping("/editar/{id}")
    fun editarAluno(
        @PathVariable id: Long,
        @RequestParam nome: String,
        @RequestParam matricula: String,
        @RequestParam curso: String,
        @RequestParam turno: String,
        @RequestParam(required = false) imagem: MultipartFile?
    ): ResponseEntity<String> {
        return try {
            // Se não foi enviada uma nova imagem, mantém a imagem atual
            val alunoExistente = alunoService.buscarAlunoPorId(id)
            val imagemBytes = imagem?.bytes ?: alunoExistente?.imagem

            // Se o aluno não existir, retornar erro
            if (alunoExistente == null) {
                return ResponseEntity.badRequest().body("Aluno não encontrado")
            }

            alunoService.editarAluno(id, nome, matricula, curso, turno, imagemBytes)
            ResponseEntity.ok("Aluno atualizado com sucesso!")
        } catch (e: Exception) {
            ResponseEntity.badRequest().body("Erro ao atualizar aluno: ${e.message}")
        }
    }

    @DeleteMapping("/excluir/{id}")
    fun excluirAluno(@PathVariable id: Long): ResponseEntity<String> {
        return try {
            alunoService.excluirAluno(id)
            ResponseEntity.ok("Aluno excluído com sucesso!")
        } catch (e: Exception) {
            ResponseEntity.badRequest().body("Erro ao excluir aluno: ${e.message}")
        }
    }
}
