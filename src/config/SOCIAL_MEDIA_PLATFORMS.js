
import { 
  FaFacebook, FaInstagram, FaTwitter, FaLinkedin, FaYoutube, 
  FaTiktok, FaPinterest, FaSnapchat, FaWhatsapp, FaTelegram, 
  FaDiscord, FaViber, FaGithub, FaGitlab, FaStackOverflow, 
  FaDev, FaTwitch, FaVimeo, FaMedium, FaBehance, 
  FaDribbble, FaSpotify, FaSoundcloud, FaApple, FaGlobe
} from 'react-icons/fa6';
import { SiSubstack, SiUpwork, SiFiverr } from 'react-icons/si';

// Helper to clean username
const cleanUsername = (input, baseUrl) => {
  if (!input) return '';
  // Remove Base URL if present
  let clean = input.replace(baseUrl, '');
  // Remove @ if present at start
  if (clean.startsWith('@')) clean = clean.substring(1);
  // Remove trailing slashes
  clean = clean.replace(/\/$/, '');
  return clean;
};

export const SOCIAL_MEDIA_PLATFORMS = [
  {
    id: 'facebook',
    name: 'Facebook',
    baseUrl: 'https://facebook.com/',
    urlPattern: /^(https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.]+\/?)$/,
    placeholder: 'https://facebook.com/username',
    icon: FaFacebook,
    color: '#1877F2',
    formatUrl: (input) => `https://facebook.com/${cleanUsername(input, 'https://facebook.com/')}`
  },
  {
    id: 'instagram',
    name: 'Instagram',
    baseUrl: 'https://instagram.com/',
    urlPattern: /^(https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?)$/,
    placeholder: '@username or https://instagram.com/username',
    icon: FaInstagram,
    color: '#E4405F',
    formatUrl: (input) => `https://instagram.com/${cleanUsername(input, 'https://instagram.com/')}`
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    baseUrl: 'https://x.com/',
    urlPattern: /^(https?:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]+\/?)$/,
    placeholder: '@username or https://x.com/username',
    icon: FaTwitter,
    color: '#000000',
    formatUrl: (input) => {
      const clean = cleanUsername(input, 'https://twitter.com/').replace('https://x.com/', '');
      return `https://x.com/${clean}`;
    }
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    baseUrl: 'https://linkedin.com/in/',
    urlPattern: /^(https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+\/?)$/,
    placeholder: 'https://linkedin.com/in/username',
    icon: FaLinkedin,
    color: '#0A66C2',
    formatUrl: (input) => {
      if (input.includes('linkedin.com')) return input;
      return `https://linkedin.com/in/${cleanUsername(input, '')}`;
    }
  },
  {
    id: 'youtube',
    name: 'YouTube',
    baseUrl: 'https://youtube.com/@',
    urlPattern: /^(https?:\/\/(www\.)?youtube\.com\/(@[a-zA-Z0-9_-]+|c\/[a-zA-Z0-9_-]+|channel\/[a-zA-Z0-9_-]+)\/?)$/,
    placeholder: 'https://youtube.com/@channel',
    icon: FaYoutube,
    color: '#FF0000',
    formatUrl: (input) => {
      if (input.includes('youtube.com')) return input;
      const clean = cleanUsername(input, '');
      return `https://youtube.com/@${clean}`;
    }
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    baseUrl: 'https://tiktok.com/@',
    urlPattern: /^(https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9_.]+\/?)$/,
    placeholder: '@username',
    icon: FaTiktok,
    color: '#000000',
    formatUrl: (input) => {
      const clean = cleanUsername(input, 'https://tiktok.com/');
      return `https://tiktok.com/@${clean}`;
    }
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    baseUrl: 'https://pinterest.com/',
    urlPattern: /^(https?:\/\/(www\.)?pinterest\.com\/[a-zA-Z0-9_]+\/?)$/,
    placeholder: 'username',
    icon: FaPinterest,
    color: '#BD081C',
    formatUrl: (input) => `https://pinterest.com/${cleanUsername(input, 'https://pinterest.com/')}`
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    baseUrl: 'https://snapchat.com/add/',
    urlPattern: /^(https?:\/\/(www\.)?snapchat\.com\/add\/[a-zA-Z0-9._-]+\/?)$/,
    placeholder: 'username',
    icon: FaSnapchat,
    color: '#FFFC00',
    formatUrl: (input) => `https://snapchat.com/add/${cleanUsername(input, 'https://snapchat.com/add/')}`
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    baseUrl: 'https://wa.me/',
    urlPattern: /^(https?:\/\/wa\.me\/[0-9]+\/?)$/,
    placeholder: '1234567890 (Phone with country code)',
    icon: FaWhatsapp,
    color: '#25D366',
    formatUrl: (input) => {
      const clean = input.replace(/[^0-9]/g, '');
      return `https://wa.me/${clean}`;
    }
  },
  {
    id: 'telegram',
    name: 'Telegram',
    baseUrl: 'https://t.me/',
    urlPattern: /^(https?:\/\/t\.me\/[a-zA-Z0-9_]+\/?)$/,
    placeholder: 'username',
    icon: FaTelegram,
    color: '#0088cc',
    formatUrl: (input) => `https://t.me/${cleanUsername(input, 'https://t.me/')}`
  },
  {
    id: 'discord',
    name: 'Discord',
    baseUrl: 'https://discord.gg/',
    urlPattern: /^(https?:\/\/(www\.)?discord\.(gg|com\/invite)\/[a-zA-Z0-9]+\/?)$/,
    placeholder: 'Invite Code',
    icon: FaDiscord,
    color: '#5865F2',
    formatUrl: (input) => {
      if (input.includes('discord')) return input;
      return `https://discord.gg/${input}`;
    }
  },
  {
    id: 'viber',
    name: 'Viber',
    baseUrl: 'viber://chat?number=',
    urlPattern: /^(viber:\/\/chat\?number=[0-9+]+)$/,
    placeholder: '+123456789',
    icon: FaViber,
    color: '#665CAC',
    formatUrl: (input) => {
      if (input.startsWith('viber://')) return input;
      return `viber://chat?number=${input.replace(/[^0-9+]/g, '')}`;
    }
  },
  {
    id: 'github',
    name: 'GitHub',
    baseUrl: 'https://github.com/',
    urlPattern: /^(https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/?)$/,
    placeholder: 'username',
    icon: FaGithub,
    color: '#333',
    formatUrl: (input) => `https://github.com/${cleanUsername(input, 'https://github.com/')}`
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    baseUrl: 'https://gitlab.com/',
    urlPattern: /^(https?:\/\/(www\.)?gitlab\.com\/[a-zA-Z0-9-.]+\/?)$/,
    placeholder: 'username',
    icon: FaGitlab,
    color: '#FC6D26',
    formatUrl: (input) => `https://gitlab.com/${cleanUsername(input, 'https://gitlab.com/')}`
  },
  {
    id: 'stackoverflow',
    name: 'Stack Overflow',
    baseUrl: 'https://stackoverflow.com/users/',
    urlPattern: /^(https?:\/\/(www\.)?stackoverflow\.com\/users\/[0-9]+\/[a-zA-Z0-9-]+\/?)$/,
    placeholder: 'https://stackoverflow.com/users/123/name',
    icon: FaStackOverflow,
    color: '#F48024',
    formatUrl: (input) => input // Complex URL structure, prefer direct input
  },
  {
    id: 'devto',
    name: 'Dev.to',
    baseUrl: 'https://dev.to/',
    urlPattern: /^(https?:\/\/(www\.)?dev\.to\/[a-zA-Z0-9-]+\/?)$/,
    placeholder: 'username',
    icon: FaDev,
    color: '#0A0A0A',
    formatUrl: (input) => `https://dev.to/${cleanUsername(input, 'https://dev.to/')}`
  },
  {
    id: 'twitch',
    name: 'Twitch',
    baseUrl: 'https://twitch.tv/',
    urlPattern: /^(https?:\/\/(www\.)?twitch\.tv\/[a-zA-Z0-9_]+\/?)$/,
    placeholder: 'username',
    icon: FaTwitch,
    color: '#9146FF',
    formatUrl: (input) => `https://twitch.tv/${cleanUsername(input, 'https://twitch.tv/')}`
  },
  {
    id: 'vimeo',
    name: 'Vimeo',
    baseUrl: 'https://vimeo.com/',
    urlPattern: /^(https?:\/\/(www\.)?vimeo\.com\/[a-zA-Z0-9]+\/?)$/,
    placeholder: 'username',
    icon: FaVimeo,
    color: '#1AB7EA',
    formatUrl: (input) => `https://vimeo.com/${cleanUsername(input, 'https://vimeo.com/')}`
  },
  {
    id: 'medium',
    name: 'Medium',
    baseUrl: 'https://medium.com/@',
    urlPattern: /^(https?:\/\/(www\.)?medium\.com\/@[a-zA-Z0-9.-]+\/?)$/,
    placeholder: '@username',
    icon: FaMedium,
    color: '#000000',
    formatUrl: (input) => `https://medium.com/@${cleanUsername(input, 'https://medium.com/')}`
  },
  {
    id: 'substack',
    name: 'Substack',
    baseUrl: 'https://substack.com/@',
    urlPattern: /^(https?:\/\/[a-zA-Z0-9-]+\.substack\.com\/?|https?:\/\/substack\.com\/@[a-zA-Z0-9-]+\/?)$/,
    placeholder: 'yourname.substack.com',
    icon: SiSubstack,
    color: '#FF6719',
    formatUrl: (input) => {
      if (input.includes('substack.com')) return input;
      return `https://${input}.substack.com`;
    }
  },
  {
    id: 'behance',
    name: 'Behance',
    baseUrl: 'https://behance.net/',
    urlPattern: /^(https?:\/\/(www\.)?behance\.net\/[a-zA-Z0-9-]+\/?)$/,
    placeholder: 'username',
    icon: FaBehance,
    color: '#1769FF',
    formatUrl: (input) => `https://behance.net/${cleanUsername(input, 'https://behance.net/')}`
  },
  {
    id: 'dribbble',
    name: 'Dribbble',
    baseUrl: 'https://dribbble.com/',
    urlPattern: /^(https?:\/\/(www\.)?dribbble\.com\/[a-zA-Z0-9-]+\/?)$/,
    placeholder: 'username',
    icon: FaDribbble,
    color: '#EA4C89',
    formatUrl: (input) => `https://dribbble.com/${cleanUsername(input, 'https://dribbble.com/')}`
  },
  {
    id: 'upwork',
    name: 'Upwork',
    baseUrl: 'https://upwork.com/freelancers/',
    urlPattern: /^(https?:\/\/(www\.)?upwork\.com\/(freelancers\/[a-zA-Z0-9.~_-]+|o\/companies\/[a-zA-Z0-9.~_-]+)\/?)$/,
    placeholder: 'https://upwork.com/freelancers/...',
    icon: SiUpwork,
    color: '#6FDA44',
    formatUrl: (input) => input // Complex URL, prefer direct
  },
  {
    id: 'fiverr',
    name: 'Fiverr',
    baseUrl: 'https://fiverr.com/',
    urlPattern: /^(https?:\/\/(www\.)?fiverr\.com\/[a-zA-Z0-9_]+\/?)$/,
    placeholder: 'username',
    icon: SiFiverr,
    color: '#1DBF73',
    formatUrl: (input) => `https://fiverr.com/${cleanUsername(input, 'https://fiverr.com/')}`
  },
  {
    id: 'spotify',
    name: 'Spotify',
    baseUrl: 'https://open.spotify.com/user/',
    urlPattern: /^(https?:\/\/open\.spotify\.com\/(user|artist|show)\/[a-zA-Z0-9]+\/?)$/,
    placeholder: 'https://open.spotify.com/user/...',
    icon: FaSpotify,
    color: '#1DB954',
    formatUrl: (input) => input
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    baseUrl: 'https://soundcloud.com/',
    urlPattern: /^(https?:\/\/(www\.)?soundcloud\.com\/[a-zA-Z0-9-]+\/?)$/,
    placeholder: 'username',
    icon: FaSoundcloud,
    color: '#FF5500',
    formatUrl: (input) => `https://soundcloud.com/${cleanUsername(input, 'https://soundcloud.com/')}`
  },
  {
    id: 'applemusic',
    name: 'Apple Music',
    baseUrl: 'https://music.apple.com/',
    urlPattern: /^(https?:\/\/music\.apple\.com\/[a-z]{2}\/(artist|album|playlist)\/[a-zA-Z0-9-]+\/[0-9]+\/?)$/,
    placeholder: 'https://music.apple.com/...',
    icon: FaApple,
    color: '#FA243C',
    formatUrl: (input) => input
  },
  {
    id: 'generic',
    name: 'Website / Other',
    baseUrl: 'https://',
    urlPattern: /^(https?:\/\/[a-zA-Z0-9-.]+\.[a-z]{2,}(\/.*)?)$/,
    placeholder: 'https://example.com',
    icon: FaGlobe,
    color: '#64748b',
    formatUrl: (input) => input.startsWith('http') ? input : `https://${input}`
  }
];
