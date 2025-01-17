import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../assets/styles/theme';
import { Search } from 'lucide-react';

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: ${theme.colors.background};
`;

const SearchInput = styled.input`
  flex-grow: 1;
  padding: 5px 10px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  font-size: ${theme.fontSizes.medium};
`;

const SearchButton = styled.button`
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  padding: 5px 10px;
  margin-left: 5px;
  border-radius: ${theme.borderRadius.small};
  cursor: pointer;

  &:hover {
    background-color: ${theme.colors.primary}dd;
  }
`;

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <SearchContainer>
      <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%' }}>
        <SearchInput
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search messages..."
        />
        <SearchButton type="submit">
          <Search size={16} />
        </SearchButton>
      </form>
    </SearchContainer>
  );
};

export default SearchBar;

