import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users, ArrowRight, Heart, Share2, Bookmark } from 'lucide-react';

interface EventsCardProps {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  attendees: number;
  maxAttendees: number;
  image: string;
  price: number;
  featured?: boolean;
  onRegister?: (eventId: number) => void;
  onLike?: (eventId: number) => void;
  onBookmark?: (eventId: number) => void;
  onShare?: (eventId: number) => void;
  className?: string;
}

const EventsCard: React.FC<EventsCardProps> = ({
  id,
  title,
  date,
  time,
  location,
  description,
  category,
  attendees,
  maxAttendees,
  image,
  price,
  featured = false,
  onRegister,
  onLike,
  onBookmark,
  onShare,
  className = ""
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' })
    };
  };

  const getAttendancePercentage = (attendees: number, maxAttendees: number) => {
    return Math.min((attendees / maxAttendees) * 100, 100);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      technology: 'bg-blue-100 text-blue-800',
      design: 'bg-purple-100 text-purple-800',
      networking: 'bg-green-100 text-green-800',
      marketing: 'bg-orange-100 text-orange-800',
      business: 'bg-red-100 text-red-800',
      education: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    onLike?.(id);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    onBookmark?.(id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(id);
  };

  const handleRegister = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRegister?.(id);
  };

  const formattedDate = formatDate(date);
  const attendancePercentage = getAttendancePercentage(attendees, maxAttendees);
  const isSoldOut = attendees >= maxAttendees;

  return (
    <div
      className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer ${
        featured ? 'ring-2 ring-blue-500/20' : ''
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
          Featured
        </div>
      )}

      {/* Sold Out Badge */}
      {isSoldOut && (
        <div className="absolute top-4 right-4 z-20 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
          Sold Out
        </div>
      )}

      {/* Action Buttons */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={handleLike}
          className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${
            isLiked 
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={handleBookmark}
          className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-300 ${
            isBookmarked 
              ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30' 
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-yellow-500'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={handleShare}
          className="w-10 h-10 rounded-full bg-white/80 text-gray-600 hover:bg-white hover:text-blue-500 flex items-center justify-center backdrop-blur-sm transition-all duration-300"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Date Overlay */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="text-2xl font-bold text-gray-900">{formattedDate.day}</div>
          <div className="text-sm text-gray-600 uppercase">{formattedDate.month}</div>
          <div className="text-xs text-gray-500">{formattedDate.weekday}</div>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-6">
        {/* Category Tag */}
        <div className="mb-3">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
          {description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </div>

        {/* Attendees Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {attendees} / {maxAttendees}
            </span>
            <span className="text-xs">
              {attendancePercentage.toFixed(0)}% full
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                attendancePercentage > 80 
                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                  : attendancePercentage > 60 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
              }`}
              style={{ width: `${attendancePercentage}%` }}
            />
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            {price === 0 ? (
              <span className="text-green-600">Free</span>
            ) : (
              <span>${price}</span>
            )}
          </div>
          <button 
            onClick={handleRegister}
            disabled={isSoldOut}
            className={`px-6 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 group ${
              isSoldOut 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-600/30'
            }`}
          >
            {isSoldOut ? 'Sold Out' : 'Register'}
            {!isSoldOut && (
              <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${
                isHovered ? 'translate-x-1' : ''
              }`} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Example usage component
const EventsCardExample: React.FC = () => {
  const sampleEvent = {
    id: 1,
    title: "AI & Machine Learning Summit 2025",
    date: "2025-08-15",
    time: "09:00 AM - 05:00 PM",
    location: "San Francisco Convention Center",
    description: "Join industry leaders for cutting-edge insights into AI and machine learning technologies. This comprehensive summit covers the latest trends, practical applications, and future directions in artificial intelligence.",
    category: "technology",
    attendees: 234,
    maxAttendees: 500,
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop",
    price: 299,
    featured: true
  };

  const handleRegister = (eventId: number) => {
    console.log(`Registering for event ${eventId}`);
  };

  const handleLike = (eventId: number) => {
    console.log(`Liked event ${eventId}`);
  };

  const handleBookmark = (eventId: number) => {
    console.log(`Bookmarked event ${eventId}`);
  };

  const handleShare = (eventId: number) => {
    console.log(`Sharing event ${eventId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Events Card Component
        </h1>
        <EventsCard
          {...sampleEvent}
          onRegister={handleRegister}
          onLike={handleLike}
          onBookmark={handleBookmark}
          onShare={handleShare}
        />
      </div>
    </div>
  );
};

export default EventsCardExample;