import { useState, useEffect } from 'react';
import { CheckSquare, Calendar, Phone, Mail } from 'lucide-react';
import api from '../services/api';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasksDynamically = async () => {
      try {
        const [leadsRes, dealsRes] = await Promise.all([
          api.get('/leads'),
          api.get('/deals')
        ]);
        
        const generatedTasks = [];
        let taskId = 1;
        
        // Task 1: New leads to contact
        leadsRes.data.filter(l => l.status === 'New').forEach(lead => {
          generatedTasks.push({
            id: taskId++,
            title: `Initial outreach to ${lead.name}`,
            company: lead.company,
            type: 'Email',
            icon: Mail,
            priority: 'High',
            dueDate: new Date().toLocaleDateString(),
            completed: false
          });
        });

        // Task 2: Stagnant deals to follow up
        dealsRes.data.filter(d => d.stage === 'Negotiation' || d.stage === 'Meeting Scheduled').forEach(deal => {
          generatedTasks.push({
            id: taskId++,
            title: `Follow up on ${deal.title}`,
            company: deal.leadId?.company || 'Unknown',
            type: 'Call',
            icon: Phone,
            priority: 'Medium',
            dueDate: new Date(Date.now() + 86400000).toLocaleDateString(), // tomorrow
            completed: false
          });
        });

        setTasks(generatedTasks);
      } catch (error) {
        console.error("Failed to fetch data for tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasksDynamically();
  }, []);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="h-full flex flex-col pt-4 animate-in fade-in duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">Tasks & Activities</h1>
        <p className="text-gray-400 text-sm mt-1">Actions auto-generated dynamically from your pipeline and leads.</p>
      </div>

      <div className="flex-1 bg-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm overflow-y-auto">
        {loading ? (
          <div className="text-gray-400 flex items-center justify-center p-12">Loading dynamically generated tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center p-12">
            <CheckSquare className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-gray-300 font-medium text-lg">You&apos;re all caught up!</h3>
            <p className="text-gray-500 text-sm mt-2">No pending tasks generated from your pipeline.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {tasks.map(task => {
              const Icon = task.icon;
              return (
                <div 
                  key={task.id} 
                  className={`flex justify-between items-center p-5 rounded-lg border transition-all duration-300 ${
                    task.completed 
                      ? 'bg-gray-800/20 border-gray-800/50 opacity-60' 
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600 shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-5">
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className={`h-6 w-6 rounded border flex items-center justify-center transition-colors ${
                        task.completed ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-500 hover:border-primary-400'
                      }`}
                    >
                      {task.completed && <CheckSquare className="h-4 w-4" />}
                    </button>
                    <div className="flex items-center justify-center h-10 w-10 rounded bg-gray-700/50 text-gray-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className={`text-base font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                        {task.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">{task.company} • Auto-generated context</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      task.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {task.priority} Priority
                    </span>
                    <div className="flex items-center text-gray-400 bg-gray-900/50 px-3 py-1.5 rounded-md">
                      <Calendar className="h-4 w-4 mr-2" />
                      {task.dueDate}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
