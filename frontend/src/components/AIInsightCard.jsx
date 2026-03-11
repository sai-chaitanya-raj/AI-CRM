import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import PropTypes from 'prop-types';

const AIInsightCard = ({ title, insight, confidence, className }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-xl p-5 shadow-lg group ${className}`}
    >
      {/* Background glow effect */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-all duration-500"></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-primary-400" />
          <h3 className="text-sm font-medium text-primary-400 uppercase tracking-wider">{title}</h3>
        </div>
        {confidence && (
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
            {Math.round(confidence * 100)}% Match
          </span>
        )}
      </div>
      
      <p className="mt-4 text-gray-300 text-sm leading-relaxed relative z-10">
        {insight}
      </p>
    </motion.div>
  );
};

AIInsightCard.propTypes = {
  title: PropTypes.string.isRequired,
  insight: PropTypes.string.isRequired,
  confidence: PropTypes.number,
  className: PropTypes.string,
};

export default AIInsightCard;
