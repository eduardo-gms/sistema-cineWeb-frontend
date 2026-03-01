import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createSala, getSalaById, updateSala } from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

// Esquema de validação com Zod
const salaSchema = z.object({
  numero: z.number({ invalid_type_error: "Informe o número da sala" })
    .positive("O número deve ser positivo")
    .int("Deve ser um número inteiro"),
  capacidade: z.number({ invalid_type_error: "Informe a capacidade" })
    .positive("A capacidade deve ser maior que 0")
    .int("Deve ser um número inteiro"),
});

type SalaSchema = z.infer<typeof salaSchema>;

const SalasForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SalaSchema>({
    resolver: zodResolver(salaSchema)
  });

  useEffect(() => {
    if (isEditing) {
      getSalaById(id).then(response => {
        reset(response.data);
      }).catch(error => {
        console.error("Erro ao carregar sala para edição", error);
        alert("Erro ao carregar a sala.");
      });
    }
  }, [id, isEditing, reset]);

  const onSubmit = async (data: SalaSchema) => {
    try {
      if (isEditing) {
        await updateSala(id, data);
        alert('Sala atualizada com sucesso!');
      } else {
        await createSala(data);
        alert('Sala cadastrada com sucesso!');
      }
      navigate('/salas');
    } catch (error) {
      console.error("Erro ao salvar sala", error);
      alert("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="card p-4 mx-auto" style={{ maxWidth: '600px' }}>
      <h3 className="card-title mb-4">{isEditing ? 'Editar Sala' : 'Cadastro de Sala'}</h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Número da Sala</label>
          <input
            type="number"
            className={`form-control ${errors.numero ? 'is-invalid' : ''}`}
            {...register('numero', { valueAsNumber: true })}
            placeholder="Ex: 1"
          />
          <div className="invalid-feedback">{errors.numero?.message}</div>
        </div>

        <div className="mb-3">
          <label className="form-label">Capacidade Máxima</label>
          <input
            type="number"
            className={`form-control ${errors.capacidade ? 'is-invalid' : ''}`}
            {...register('capacidade', { valueAsNumber: true })}
            placeholder="Ex: 120"
          />
          <div className="invalid-feedback">{errors.capacidade?.message}</div>
        </div>

        <div className="d-flex justify-content-between">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/salas')}>
            Voltar
          </button>
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Atualizar Sala' : 'Salvar Sala'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalasForm;