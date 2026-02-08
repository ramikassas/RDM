
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = ({ items }) => {
  return (
    <nav 
      className="flex mb-6 text-sm font-medium text-slate-500" 
      aria-label="Breadcrumb"
    >
      <ol 
        className="inline-flex items-center space-x-1 md:space-x-3" 
        itemScope 
        itemType="https://schema.org/BreadcrumbList"
      >
        <li 
          className="inline-flex items-center" 
          itemProp="itemListElement" 
          itemScope 
          itemType="https://schema.org/ListItem"
        >
          <Link 
            to="/" 
            className="inline-flex items-center hover:text-emerald-600 transition-colors"
            itemProp="item"
            title="Go to Homepage"
          >
            <Home className="w-4 h-4 mr-2" aria-hidden="true" />
            <span itemProp="name">Home</span>
          </Link>
          <meta itemProp="position" content="1" />
        </li>
        
        {items.map((item, index) => (
          <li 
            key={index} 
            itemProp="itemListElement" 
            itemScope 
            itemType="https://schema.org/ListItem"
          >
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 text-slate-400 mx-1" aria-hidden="true" />
              {item.path ? (
                <Link 
                  to={item.path} 
                  className="hover:text-emerald-600 transition-colors"
                  itemProp="item"
                  title={`Go to ${item.label}`}
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
              ) : (
                <span className="text-slate-900 font-semibold" aria-current="page">
                  <span itemProp="name">{item.label}</span>
                </span>
              )}
              <meta itemProp="position" content={index + 2} />
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
