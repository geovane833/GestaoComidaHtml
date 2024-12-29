package com.example.ControledeMerenda

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import java.sql.DriverManager
import java.sql.Statement

@SpringBootApplication
class ControledeMerendaApplication

fun main(args: Array<String>) {
	criarBancoSeNaoExistir()
	runApplication<ControledeMerendaApplication>(*args)
}

fun criarBancoSeNaoExistir() {
	val url = "jdbc:postgresql://localhost:5432/postgres" // Conecta ao banco padrão
	val usuario = "postgres"
	val senha = "123"
	val nomeBanco = "ControledeMerenda"

	try {
		// Conecta ao banco "postgres" para verificar se o banco alvo existe
		DriverManager.getConnection(url, usuario, senha).use { conn ->
			val stmt = conn.createStatement()

			// Verifica se o banco de dados existe
			val sqlVerifica = "SELECT 1 FROM pg_database WHERE datname = '$nomeBanco'"
			val rs = stmt.executeQuery(sqlVerifica)

			if (!rs.next()) {
				// Cria o banco se ele não existir
				val sqlCriaBanco = "CREATE DATABASE \"$nomeBanco\""
				stmt.executeUpdate(sqlCriaBanco)
				println("Banco de dados criado: $nomeBanco")
			} else {
				println("Banco de dados já existe: $nomeBanco")
			}
		}

		// Após criar o banco, conecta-se ao banco criado para criar as tabelas
		criarTabelas(nomeBanco, usuario, senha)
	} catch (e: Exception) {
		println("Erro ao verificar/criar o banco de dados: ${e.message}")
		e.printStackTrace()
	}
}

fun criarTabelas(nomeBanco: String, usuario: String, senha: String) {
	val urlBanco = "jdbc:postgresql://localhost:5432/$nomeBanco" // Conexão ao banco
	try {
		DriverManager.getConnection(urlBanco, usuario, senha).use { conn ->
			conn.autoCommit = false // Usar transações

			try {
				val stmt = conn.createStatement()

				// Criação da tabela 'alunos'
				stmt.execute("""
                    CREATE TABLE IF NOT EXISTS alunos (
                        id SERIAL PRIMARY KEY,
                        nome VARCHAR(255) NOT NULL,
                        matricula VARCHAR(50) NOT NULL UNIQUE,
                        curso VARCHAR(255) NOT NULL,
                        turno VARCHAR(50) NOT NULL,
                        imagem BYTEA
                    )
                """.trimIndent())
				println("Tabela 'alunos' criada/verificada com sucesso.")

				// Criação da tabela 'comidas'
				stmt.execute("""
                    CREATE TABLE IF NOT EXISTS comidas (
                        id SERIAL PRIMARY KEY,
                        nome VARCHAR(255) NOT NULL,
                        imagem BYTEA
                    )
                """.trimIndent())
				println("Tabela 'comidas' criada/verificada com sucesso.")

				// Criação da tabela 'eventos_merenda'
				stmt.execute("""
                    CREATE TABLE IF NOT EXISTS eventos_merenda (
                        id SERIAL PRIMARY KEY, -- ID único para o evento
                        data DATE NOT NULL, -- Data da merenda
                        turno VARCHAR(50) NOT NULL, -- Turno (matutino, vespertino, etc.)
                        comida_id INT REFERENCES comidas(id), -- Relacionamento com a comida servida
                        horario_inicio TIMESTAMP NOT NULL, -- Horário de início da merenda
                        horario_fim TIMESTAMP -- Horário de término (opcional)
                    )
                """.trimIndent())
				println("Tabela 'eventos_merenda' criada/verificada com sucesso.")

				// Criação da tabela 'controle_merendas'
				stmt.execute("""
                   CREATE TABLE IF NOT EXISTS controle_merendas (
						id SERIAL PRIMARY KEY, 
						evento_id INT NOT NULL REFERENCES eventos_merenda(id), 
						aluno_id INT REFERENCES alunos(id), 
						status VARCHAR(20) CHECK (status IN ('PENDENTE', 'APROVADO', 'REJEITADO')), 
						quantidade INT NOT NULL, 
						horario_registro TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP, 
						observacao TEXT
					)
					""".trimIndent())
				println("Tabela 'controle_merendas' criada/verificada com sucesso.")

				// Criar índices para otimizar buscas
				criarIndice(stmt, "controle_merendas", "evento_id")
				criarIndice(stmt, "controle_merendas", "aluno_id")
				criarIndice(stmt, "eventos_merenda", "comida_id")

				// Confirma a transação
				conn.commit()
				println("Tabelas e índices criados com sucesso.")
			} catch (e: Exception) {
				conn.rollback() // Desfaz as alterações em caso de erro
				println("Erro ao criar as tabelas ou índices: ${e.message}")
				throw e
			}
		}
	} catch (e: Exception) {
		println("Erro geral ao conectar ou criar tabelas: ${e.message}")
		e.printStackTrace()
	}
}

// Método para criar índices
fun criarIndice(stmt: Statement, tabela: String, coluna: String) {
	val indiceNome = "idx_${coluna}_$tabela"
	stmt.execute("""
        CREATE INDEX IF NOT EXISTS $indiceNome ON $tabela ($coluna)
    """.trimIndent())
	println("Índice '$indiceNome' criado/verificado com sucesso.")
}
