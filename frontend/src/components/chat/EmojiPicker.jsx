import React from 'react';

const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const emojiCategories = {
    'Smileys': [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩'
    ],
    'Gestures': [
      '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
      '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👌',
      '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆'
    ],
    'Objects': [
      '💻', '📱', '📷', '🎥', '📺', '📻', '🎙️', '🎚️', '🎛️', '📻',
      '📱', '📲', '☎️', '📞', '📟', '📠', '🔋', '🔌', '💡', '🔦',
      '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰'
    ],
    'Nature': [
      '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁',
      '🍂', '🍃', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜',
      '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙'
    ],
    'Food': [
      '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
      '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬',
      '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠'
    ]
  };

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-gray-700">Emojis</h4>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-lg"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {Object.entries(emojiCategories).map(([category, emojis]) => (
          <div key={category}>
            <h5 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              {category}
            </h5>
            <div className="grid grid-cols-8 gap-1">
              {emojis.map((emoji, index) => (
                <button
                  key={`${category}-${index}`}
                  onClick={() => onEmojiSelect(emoji)}
                  className="w-8 h-8 text-lg hover:bg-gray-100 rounded cursor-pointer transition-colors"
                  title={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;

