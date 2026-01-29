import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePrograms } from '@/contexts/ProgramsContext';
import { Loader2, Calendar } from 'lucide-react';
import { Program } from '@/contexts/ProgramsContext';

interface EditProgramDialogProps {
  program: Program | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function EditProgramDialog({
  program,
  open,
  onOpenChange,
  onSuccess,
}: EditProgramDialogProps) {
  const [formData, setFormData] = useState<Partial<Program>>(program || {});
  const { updateProgram } = usePrograms();
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (program) {
      setFormData(program);
    }
  }, [program, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program) return;

    try {
      setIsSaving(true);
      await updateProgram(program.id, formData);
      setIsSaving(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      setIsSaving(false);
      console.error('Erro ao atualizar programa:', error);
    }
  };

  if (!program) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Programa: {program.nome}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="statusGT">Status GT</Label>
                <Select
                  value={formData.statusGT || ''}
                  onValueChange={(value) => setFormData({ ...formData, statusGT: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nao-nomeado">Não Nomeado</SelectItem>
                    <SelectItem value="em-atividade">Em Atividade</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="percentualConclusao">Percentual de Conclusão (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.percentualConclusao || 0}
                  onChange={(e) => setFormData({ ...formData, percentualConclusao: parseInt(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coordenador">Coordenador</Label>
                <Input
                  value={formData.coordenador || ''}
                  onChange={(e) => setFormData({ ...formData, coordenador: e.target.value })}
                  placeholder="Nome do coordenador"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Status de Entregas</Label>
                <div className="grid grid-cols-1 gap-3">
                  {['documentoSintese', 'parecerTecnico', 'cartaCompromissoElaborada', 'cartaCompromissoAnalisada', 'statusCGProg'].map((field) => (
                    <div key={field} className="flex items-center justify-between gap-4">
                      <Label className="text-xs capitalize flex-1">{field.replace(/([A-Z])/g, ' $1')}</Label>
                      <Select
                        value={(formData as any)[field] || 'nao-iniciado'}
                        onValueChange={(val) => setFormData({ ...formData, [field]: val })}
                      >
                        <SelectTrigger className="h-8 w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nao-iniciado">✗ Não Iniciado</SelectItem>
                          <SelectItem value="em-andamento">⏳ Em Andamento</SelectItem>
                          <SelectItem value="instituido">⏳ Instituído</SelectItem>
                          <SelectItem value="concluido">✓ Concluído</SelectItem>
                          <SelectItem value="ativo">✓ Ativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Prazos e Checklists
            </h3>
            <div className="bg-slate-50 p-4 rounded-lg space-y-4">
              <p className="text-xs text-slate-500">Configure os prazos (em dias) para as etapas principais do programa.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.checklist?.slice(0, 6).map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 bg-white p-2 rounded border">
                    <span className="text-[10px] font-medium text-slate-600 truncate flex-1">{item.descricao}</span>
                    <div className="flex items-center gap-1">
                      <Label className="text-[9px] font-bold">PRAZO:</Label>
                      <Input
                        type="number"
                        className="h-7 w-16 text-xs"
                        value={item.prazoDias || 0}
                        onChange={(e) => {
                          const newChecklist = [...(formData.checklist || [])];
                          newChecklist[idx] = { ...item, prazoDias: parseInt(e.target.value) || 0 };
                          setFormData({ ...formData, checklist: newChecklist });
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</> : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
