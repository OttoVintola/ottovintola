import React, { useState, useEffect } from 'react';

const PhotoModal = ({ photo, isOpen, onClose }) => {
  if (!isOpen || !photo) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white text-2xl font-bold z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70"
        >
          
        </button>
        <img
          src={photo.src}
          alt={photo.alt}
          className="max-w-full max-h-[calc(100vh-8rem)] object-contain"
        />
    
      </div>
    </div>
  );
};

const YearSection = ({ year, photos, isOpen, onToggle }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState({});

  const handlePhotoClick = (photo) => {
    setSelectedPhoto(photo);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPhoto(null);
  };

  const handleImageLoad = (index, naturalWidth, naturalHeight) => {
    const aspectRatio = naturalWidth / naturalHeight;
    setImageLoaded(prev => ({
      ...prev,
      [index]: { aspectRatio, isNarrow: aspectRatio < 1.2 }
    }));
  };

  // Group photos for layout - put narrow photos together when possible
  const arrangePhotos = (photos) => {
    const arranged = [];
    let i = 0;
    
    while (i < photos.length) {
      const currentPhoto = photos[i];
      const currentData = imageLoaded[i];
      const nextPhoto = photos[i + 1];
      const nextData = imageLoaded[i + 1];
      
      // If current and next are both narrow, group them
      if (currentData?.isNarrow && nextData?.isNarrow && i + 1 < photos.length) {
        arranged.push({
          type: 'pair',
          photos: [
            { ...currentPhoto, index: i },
            { ...nextPhoto, index: i + 1 }
          ]
        });
        i += 2;
      } else {
        arranged.push({
          type: 'single',
          photo: { ...currentPhoto, index: i }
        });
        i += 1;
      }
    }
    
    return arranged;
  };

  const arrangedPhotos = arrangePhotos(photos);

  return (
    <div className="mb-8 border-b border-gray-200 pb-8">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left py-4 hover:bg-gray-50 rounded-lg px-2 transition-colors"
      >
        <h2 className="text-3xl font-bold">{year}</h2>
        <span className="text-2xl transform transition-transform duration-200 ease-in-out">
          {isOpen ? '-' : '+'}
        </span>
      </button>
      
      {isOpen && (
        <div className="mt-6">
          {photos.length === 0 ? (
            <p className="text-gray-500 italic">No photos added yet for {year}</p>
          ) : (
            <div className="space-y-12">
              {arrangedPhotos.map((item, groupIndex) => (
                <div key={groupIndex} className="w-full flex justify-center">
                  {item.type === 'single' ? (
                    // Single photo layout
                    <div 
                      className="cursor-pointer group max-w-5xl w-full flex justify-center"
                      onClick={() => handlePhotoClick(item.photo)}
                    >
                      <img
                        src={item.photo.src}
                        alt={item.photo.alt}
                        className="max-w-full h-auto shadow-lg hover:shadow-xl group-hover:scale-[1.02] transition-all duration-300"
                        style={{ maxHeight: '80vh' }}
                        onLoad={(e) => handleImageLoad(item.photo.index, e.target.naturalWidth, e.target.naturalHeight)}
                      />
                      
                    </div>
                  ) : (
                    // Paired photos layout for narrow images
                    <div className="flex gap-6 max-w-5xl w-full justify-center">
                      {item.photos.map((photo, photoIndex) => (
                        <div 
                          key={photoIndex}
                          className="cursor-pointer group flex-1 max-w-md"
                          onClick={() => handlePhotoClick(photo)}
                        >
                          <img
                            src={photo.src}
                            alt={photo.alt}
                            className="w-full h-auto shadow-lg hover:shadow-xl group-hover:scale-[1.02] transition-all duration-300"
                            style={{ maxHeight: '70vh' }}
                            onLoad={(e) => handleImageLoad(photo.index, e.target.naturalWidth, e.target.naturalHeight)}
                          />
                        
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <PhotoModal
        photo={selectedPhoto}
        isOpen={modalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export const Pictures = () => {
  const [photoData, setPhotoData] = useState({});
  const [openSections, setOpenSections] = useState({});

  // Load photo data on component mount
  useEffect(() => {
    loadPhotoData();
  }, []);

  const loadPhotoData = async () => {
    try {
      const response = await fetch('/photography/photos.json');
      if (response.ok) {
        const data = await response.json();
        setPhotoData(data);
        // Open the most recent year by default
        const years = Object.keys(data).sort().reverse();
        if (years.length > 0) {
          setOpenSections({ [years[0]]: true });
        }
      } else {
        // If photos.json doesn't exist, create initial structure
        setPhotoData({
          '2025': []
        });
        setOpenSections({ '2025': true });
      }
    } catch (error) {
      console.error('Error loading photo data:', error);
      // Fallback to initial structure
      setPhotoData({
        '2025': []
      });
      setOpenSections({ '2025': true });
    }
  };

  const toggleSection = (year) => {
    setOpenSections(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  // Sort years in descending order (most recent first)
  const sortedYears = Object.keys(photoData).sort().reverse();

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Pictures</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A collection of moments captured through the years.
        </p>
      </div>
      
      {sortedYears.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-500">No photo collections yet.</p>
          <p className="text-gray-400 mt-2">Photos will appear here once you add them to the photography folder.</p>
        </div>
      ) : (
        sortedYears.map(year => (
          <YearSection
            key={year}
            year={year}
            photos={photoData[year] || []}
            isOpen={openSections[year] || false}
            onToggle={() => toggleSection(year)}
          />
        ))
      )}
      
    </div>
  );
};

export default Pictures;
