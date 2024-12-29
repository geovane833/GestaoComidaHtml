package com.example.ControledeMerenda.service

import com.example.ControledeMerenda.model.Aluno
import com.example.ControledeMerenda.repository.AlunoRepository
import com.example.ControledeMerenda.repository.ControleMerendaRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.util.Optional

@Service
class AlunoService(
    @Autowired private val alunoRepository: AlunoRepository,
    @Autowired private val controleMerendaRepository: ControleMerendaRepository
) {

    // Método para cadastrar aluno (já existente)
    fun cadastrarAluno(nome: String, matricula: String, curso: String, turno: String, imagem: ByteArray?) {
        val aluno = Aluno(
            nome = nome,
            matricula = matricula,
            curso = curso,
            turno = turno,
            imagem = imagem
        )
        alunoRepository.save(aluno)
    }

    // Método para listar todos os alunos
    fun listarAlunos(): List<Aluno> {
        return alunoRepository.findAll()
    }

    // Método para buscar aluno por nome
    fun buscarPorNomeContendo(nome: String): List<Aluno> {
        // Busca alunos onde o nome contenha a string 'nome' (usando LIKE no banco)
        return alunoRepository.findByNomeContainingIgnoreCase(nome)
    }

    fun buscarPorMatriculaContendo(matricula: String): List<Aluno> {
        // Busca alunos onde a matrícula contenha a string 'matricula' (usando LIKE no banco)
        return alunoRepository.findByMatriculaContainingIgnoreCase(matricula)
    }

    // Método para buscar aluno por ID
    fun buscarAlunoPorId(id: Long): Aluno? {
        return alunoRepository.findById(id).orElse(null)
    }

    // Método para editar aluno
    fun editarAluno(id: Long, nome: String, matricula: String, curso: String, turno: String, imagem: ByteArray?, removerImagem: Boolean = false) {
        val alunoExistente = alunoRepository.findById(id)
        if (alunoExistente.isPresent) {
            val alunoAtualizado = alunoExistente.get().copy(
                nome = nome,
                matricula = matricula,
                curso = curso,
                turno = turno,
                imagem = if (removerImagem) null else imagem ?: alunoExistente.get().imagem
            )
            alunoRepository.save(alunoAtualizado)
        } else {
            throw Exception("Aluno não encontrado")
        }
    }

    // Método para excluir aluno
    fun excluirAluno(id: Long) {
        if (alunoRepository.existsById(id)) {
            alunoRepository.deleteById(id)
        } else {
            throw Exception("Aluno não encontrado")
        }
    }

    fun matriculaExiste(matricula: String): Boolean {
        return alunoRepository.existsByMatricula(matricula)
    }

    // Método para listar alunos disponíveis para um evento
    fun listarAlunosDisponiveis(eventoId: Long): List<Aluno> {
        return alunoRepository.findAlunosNaoRegistradosNoEvento(eventoId)
    }
}
