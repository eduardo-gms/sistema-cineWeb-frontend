import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createFilme, getFilmeById, updateFilme } from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

// Schema atualizado conforme Diagrama de Classes
const filmeSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório"),
  sinopse: z.string().min(10, "Sinopse deve ter no mínimo 10 caracteres"),
  duracao: z.number({ invalid_type_error: "Insira um número" }).positive("Duração deve ser positiva"),
  classificacao: z.string().min(1, "Classificação obrigatória"),
  genero: z.string().min(1, "Gênero obrigatório"),
  elenco: z.string().min(1, "Elenco é obrigatório"), // [NOVO]
  dataInicioExibicao: z.string().min(1, "Data inicial obrigatória"), // [NOVO]
  dataFinalExibicao: z.string().min(1, "Data final obrigatória"),    // [NOVO]
}).refine(data => new Date(data.dataFinalExibicao) >= new Date(data.dataInicioExibicao), {
  message: "Data final deve ser posterior à data inicial",
  path: ["dataFinalExibicao"]
});

type FilmeSchema = z.infer<typeof filmeSchema>;

const FilmesForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FilmeSchema>({
    resolver: zodResolver(filmeSchema)
  });

  useEffect(() => {
    if (isEditing) {
      getFilmeById(id).then(response => {
        const dataForm = {
          ...response.data,
          dataInicioExibicao: response.data.dataInicioExibicao.split('T')[0],
          dataFinalExibicao: response.data.dataFinalExibicao.split('T')[0]
        };
        reset(dataForm);
      }).catch(error => {
        console.error("Erro ao carregar filme para edição", error);
        alert("Erro ao carregar o filme.");
      });
    }
  }, [id, isEditing, reset]);

  const onSubmit = async (data: FilmeSchema) => {
    try {
      if (isEditing) {
        await updateFilme(id, data);
        alert('Filme atualizado com sucesso!');
      } else {
        await createFilme(data);
        alert('Filme cadastrado com sucesso!');
      }
      navigate('/filmes');
    } catch {
      alert("Erro ao salvar o filme.");
    }
  };

  return (
    <div className="card p-4">
      <h3>{isEditing ? 'Editar Filme' : 'Cadastro de Filme'}</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Título</label>
          <input {...register('titulo')} className={`form-control ${errors.titulo ? 'is-invalid' : ''}`} />
          <div className="invalid-feedback">{errors.titulo?.message}</div>
        </div>

        {/* Novo Campo: Elenco */}
        <div className="mb-3">
          <label className="form-label">Elenco</label>
          <input
            {...register('elenco')}
            className={`form-control ${errors.elenco ? 'is-invalid' : ''}`}
            placeholder="Ex: Wagner Moura, Selton Mello"
          />
          <div className="invalid-feedback">{errors.elenco?.message}</div>
        </div>

        <div className="mb-3">
          <label className="form-label">Sinopse</label>
          <textarea {...register('sinopse')} className={`form-control ${errors.sinopse ? 'is-invalid' : ''}`} />
          <div className="invalid-feedback">{errors.sinopse?.message}</div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">Duração (min)</label>
            <input type="number" {...register('duracao', { valueAsNumber: true })} className={`form-control ${errors.duracao ? 'is-invalid' : ''}`} />
            <div className="invalid-feedback">{errors.duracao?.message}</div>
          </div>
          <div className="col-md-4">
            <label className="form-label">Classificação</label>
            <select {...register('classificacao')} className="form-select">
              <option value="">Selecione...</option>
              <option value="Livre">Livre</option>
              <option value="10">10 anos</option>
              <option value="12">12 anos</option>
              <option value="14">14 anos</option>
              <option value="16">16 anos</option>
              <option value="18">18 anos</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Gênero</label>
            <select {...register('genero')} className="form-select">
              <option value="">Selecione...</option>
              <option value="Ação">Ação</option>
              <option value="Comédia">Comédia</option>
              <option value="Drama">Drama</option>
              <option value="Terror">Terror</option>
              <option value="Ficção">Ficção</option>
            </select>
          </div>
        </div>

        {/* Novos Campos: Datas de Exibição */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Início Exibição</label>
            <input type="date" {...register('dataInicioExibicao')} className={`form-control ${errors.dataInicioExibicao ? 'is-invalid' : ''}`} />
            <div className="invalid-feedback">{errors.dataInicioExibicao?.message}</div>
          </div>
          <div className="col-md-6">
            <label className="form-label">Fim Exibição</label>
            <input type="date" {...register('dataFinalExibicao')} className={`form-control ${errors.dataFinalExibicao ? 'is-invalid' : ''}`} />
            <div className="invalid-feedback">{errors.dataFinalExibicao?.message}</div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-100">{isEditing ? 'Atualizar Filme' : 'Salvar Filme'}</button>
      </form>
    </div>
  );
};

export default FilmesForm;