import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Check, X } from 'lucide-react';
import { usePrograms } from '@/contexts/ProgramsContext';

interface GTCard {
  id: string;
  nome: string;
  coordenador: string;
  membrosGT: number;
  status: 'nao-nomeado' | 'em-atividade' | 'concluido';
}

interface KanbanColumn {
  id: string;
  titulo: string;
  cards: GTCard[];
}

export default function KanbanBoard() {
  const { programs } = usePrograms();
  const [editingCard, setEditingCard] = useState<{ columnId: string; cardId: string } | null>(null);
  const [editValues, setEditValues] = useState<Partial<GTCard>>({});

  // Construir colunas a partir dos programas
  const getColumns = (): KanbanColumn[] => {
    const columns: KanbanColumn[] = [
      { id: 'nao-nomeado', titulo: 'Não Nomeado', cards: [] },
      { id: 'em-atividade', titulo: 'Em Atividade', cards: [] },
      { id: 'concluido', titulo: 'Concluído', cards: [] },
    ];

    programs.forEach(prog => {
      const card: GTCard = {
        id: prog.id,
        nome: prog.nome,
        coordenador: prog.coordenador,
        membrosGT: prog.membrosGT,
        status: prog.statusGT,
      };

      const column = columns.find(c => c.id === prog.statusGT);
      if (column) {
        column.cards.push(card);
      }
    });

    return columns;
  };

  const [columns, setColumns] = useState<KanbanColumn[]>(getColumns());

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const newColumns = columns.map(col => ({ ...col, cards: [...col.cards] }));
    const sourceColumn = newColumns.find(col => col.id === source.droppableId);
    const destColumn = newColumns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const [movedCard] = sourceColumn.cards.splice(source.index, 1);
    destColumn.cards.splice(destination.index, 0, movedCard);

    setColumns(newColumns);
  };

  const statusColors: Record<string, { bg: string; border: string }> = {
    'nao-nomeado': { bg: 'bg-red-50', border: 'border-red-200' },

    'em-atividade': { bg: 'bg-blue-50', border: 'border-blue-200' },
    'concluido': { bg: 'bg-green-50', border: 'border-green-200' },
  };

  return (
    <div className="w-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {columns.map(column => (
            <div key={column.id}>
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{column.titulo}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {column.cards.length} GTs
                  </p>
                </CardHeader>
                <CardContent>
                  <Droppable
                    droppableId={column.id}
                    isDropDisabled={false}
                    isCombineEnabled={false}
                    ignoreContainerClipping={false}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-96 p-2 rounded-lg transition-colors ${
                          snapshot.isDraggingOver ? 'bg-primary/5' : 'bg-transparent'
                        }`}
                      >
                        {column.cards.map((card, index) => (
                          <Draggable key={card.id} draggableId={card.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-3 rounded-lg border-2 cursor-move transition-all ${
                                  statusColors[card.status].bg
                                } ${statusColors[card.status].border} ${
                                  snapshot.isDragging ? 'shadow-lg rotate-3' : ''
                                }`}
                              >
                                {editingCard?.cardId === card.id ? (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={editValues.nome || ''}
                                      onChange={(e) =>
                                        setEditValues({ ...editValues, nome: e.target.value })
                                      }
                                      className="w-full px-2 py-1 text-sm border rounded"
                                      placeholder="Nome do GT"
                                    />
                                    <input
                                      type="text"
                                      value={editValues.coordenador || ''}
                                      onChange={(e) =>
                                        setEditValues({ ...editValues, coordenador: e.target.value })
                                      }
                                      className="w-full px-2 py-1 text-sm border rounded"
                                      placeholder="Coordenador"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => setEditingCard(null)}
                                        className="flex-1"
                                      >
                                        <Check className="w-3 h-3 mr-1" />
                                        Salvar
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingCard(null);
                                          setEditValues({});
                                        }}
                                        className="flex-1"
                                      >
                                        <X className="w-3 h-3 mr-1" />
                                        Cancelar
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <p className="font-semibold text-sm">{card.nome}</p>
                                        <p className="text-xs text-muted-foreground">{card.coordenador}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {card.membrosGT} membros
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingCard({ columnId: column.id, cardId: card.id });
                                          setEditValues({ ...card });
                                        }}
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
