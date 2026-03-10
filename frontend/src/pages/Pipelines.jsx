import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Sparkles, Calendar, MoreVertical } from 'lucide-react';
import api from '../services/api';

const COLUMNS = ['New Lead', 'Contacted', 'Meeting Scheduled', 'Negotiation', 'Closed Won', 'Closed Lost'];

const initialEmptyData = COLUMNS.reduce((acc, col) => ({ ...acc, [col]: [] }), {});

const Pipelines = () => {
  const [columns, setColumns] = useState(initialEmptyData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/deals');
      
      const organizedData = { ...initialEmptyData };
      data.forEach(deal => {
        if (organizedData[deal.stage]) {
          organizedData[deal.stage].push({
            id: deal._id,
            title: deal.title,
            value: `₹${deal.value.toLocaleString('en-IN')}`,
            company: deal.leadId?.company || 'Unknown',
            createdAt: deal.createdAt
          });
        }
      });
      setColumns(organizedData);
    } catch (error) {
      console.error("Error fetching deals:", error);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceColumn = [...columns[source.droppableId]];
    const destColumn = [...columns[destination.droppableId]];
    const [removed] = sourceColumn.splice(source.index, 1);

    // Optimistic UI update
    if (source.droppableId === destination.droppableId) {
      sourceColumn.splice(destination.index, 0, removed);
      setColumns({ ...columns, [source.droppableId]: sourceColumn });
    } else {
      destColumn.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn
      });

      // Update backend stage
      try {
        await api.put(`/deals/${draggableId}/stage`, { stage: destination.droppableId });
      } catch (error) {
        console.error("Failed to update deal stage:", error);
        // Revert on failure
        fetchDeals();
      }
    }
  };

  return (
    <div className="h-full flex flex-col pt-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Deal Pipeline</h1>
          <p className="text-gray-400 text-sm mt-1">Drag and drop deals to update their stage.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/20 flex items-center">
          <Sparkles className="h-4 w-4 mr-2" /> 
          AI Auto-Sort
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-4 min-w-max h-full items-start">
            {COLUMNS.map((colId) => (
              <div key={colId} className="w-80 flex flex-col bg-gray-900/40 rounded-xl border border-gray-800/60 max-h-full">
                {/* Column Header */}
                <div className="p-4 border-b border-gray-800 flex justify-between items-center backdrop-blur-md sticky top-0 z-10">
                  <h3 className="font-semibold text-gray-200">{colId}</h3>
                  <span className="text-xs font-bold text-gray-500 bg-gray-800 px-2 py-1 rounded-md">
                    {columns[colId].length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={colId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-gray-800/30' : ''
                      }`}
                      style={{ minHeight: '150px' }}
                    >
                      {columns[colId].map((deal, index) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-gray-800 border-l-4 border-l-primary-500 border border-gray-700/80 rounded-lg p-4 shadow-sm group ${
                                snapshot.isDragging ? 'shadow-lg shadow-primary-500/10 scale-[1.02] z-50 ring-1 ring-primary-500/50' : 'hover:border-gray-600 transition-all'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-gray-100 font-medium text-sm line-clamp-1">{deal.title}</h4>
                                <button className="text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="text-xs text-gray-400 mb-3">{deal.company}</div>
                              
                              <div className="flex items-center justify-between border-t border-gray-700/50 pt-3">
                                <span className="text-primary-400 font-semibold text-sm">{deal.value}</span>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  12d
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Pipelines;
