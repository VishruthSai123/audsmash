import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

interface AvatarGalleryProps {
  currentAvatar: string;
  username: string;
  onSelect: (avatarUrl: string) => void;
  onClose: () => void;
}

// Avatar styles and seeds for dicebear
const AVATAR_STYLES = [
  { name: 'Adventurer', style: 'adventurer' },
  { name: 'Avataaars', style: 'avataaars' },
  { name: 'Big Ears', style: 'big-ears' },
  { name: 'Bottts', style: 'bottts' },
  { name: 'Croodles', style: 'croodles' },
  { name: 'Fun Emoji', style: 'fun-emoji' },
  { name: 'Identicon', style: 'identicon' },
  { name: 'Lorelei', style: 'lorelei' },
  { name: 'Micah', style: 'micah' },
  { name: 'Miniavs', style: 'miniavs' },
  { name: 'Notionists', style: 'notionists' },
  { name: 'Open Peeps', style: 'open-peeps' },
  { name: 'Personas', style: 'personas' },
  { name: 'Pixel Art', style: 'pixel-art' },
  { name: 'Rings', style: 'rings' },
  { name: 'Shapes', style: 'shapes' },
];

// Generate multiple variations for each style
const generateAvatars = (username: string) => {
  const avatars: { url: string; name: string }[] = [];
  const seeds = [username, `${username}_1`, `${username}_2`, `${username}_3`, `${username}_alt`, `${username}_cool`];
  
  AVATAR_STYLES.forEach(style => {
    seeds.slice(0, 3).forEach((seed, index) => {
      avatars.push({
        url: `https://api.dicebear.com/7.x/${style.style}/svg?seed=${encodeURIComponent(seed)}`,
        name: `${style.name} ${index + 1}`
      });
    });
  });
  
  return avatars;
};

export default function AvatarGallery({ currentAvatar, username, onSelect, onClose }: AvatarGalleryProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const avatars = generateAvatars(username);

  const handleSelect = () => {
    onSelect(selectedAvatar);
    onClose();
  };

  return (
    <div className="avatar-gallery-overlay">
      <div className="avatar-gallery-modal">
        <div className="avatar-gallery-header">
          <h2>Choose Your Avatar</h2>
          <button onClick={onClose} className="close-button">
            <FaTimes />
          </button>
        </div>

        <div className="avatar-gallery-current">
          <div className="current-avatar-preview">
            <img src={selectedAvatar} alt="Selected" />
            <span>Current Selection</span>
          </div>
        </div>

        <div className="avatar-gallery-grid">
          {avatars.map((avatar, index) => (
            <div
              key={index}
              className={`avatar-option ${selectedAvatar === avatar.url ? 'selected' : ''}`}
              onClick={() => setSelectedAvatar(avatar.url)}
            >
              <img src={avatar.url} alt={avatar.name} loading="lazy" />
              <span className="avatar-label">{avatar.name}</span>
            </div>
          ))}
        </div>

        <div className="avatar-gallery-actions">
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button onClick={handleSelect} className="save-button">
            Save Avatar
          </button>
        </div>
      </div>
    </div>
  );
}
