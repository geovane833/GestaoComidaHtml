package com.example.ControledeMerenda.service

import com.example.ControledeMerenda.model.Comida
import com.example.ControledeMerenda.repository.ComidaRepository
import org.springframework.stereotype.Service

@Service
class ComidaService(private val comidaRepository: ComidaRepository) {

    // Método para cadastrar comida
    fun cadastrarComida(nome: String, imagem: ByteArray?) {
        val comida = Comida(
            nome = nome,
            imagem = imagem
        )
        comidaRepository.save(comida)
    }

    // Método para listar todas as comidas
    fun listarComidas(): List<Comida> {
        return comidaRepository.findAll()
    }

    // Método para buscar comida por nome
    fun buscarPorNomeContendo(nome: String): List<Comida> {
        return comidaRepository.findByNomeContainingIgnoreCase(nome)
    }

    // Método para buscar comida por ID
    fun buscarComidaPorId(id: Long): Comida? {
        return comidaRepository.findById(id).orElse(null)
    }

    // Método para editar comida
    fun editarComida(id: Long, nome: String, imagem: ByteArray?) {
        val comidaExistente = comidaRepository.findById(id)
        if (comidaExistente.isPresent) {
            val imagemFinal = imagem ?: null // Se imagem for null, definimos como null (remover imagem)
            val comidaAtualizada = comidaExistente.get().copy(
                nome = nome,
                imagem = imagemFinal
            )
            comidaRepository.save(comidaAtualizada)
        } else {
            throw Exception("Comida não encontrada")
        }
    }

    // Método para excluir comida
    fun excluirComida(id: Long) {
        // Verifica se o ID existe no banco de dados
        if (comidaRepository.existsById(id)) {
            // Exclui a comida pelo ID
            comidaRepository.deleteById(id)
        } else {
            // Se não existir, lança uma exceção
            throw Exception("Comida não encontrada")
        }
    }

}
