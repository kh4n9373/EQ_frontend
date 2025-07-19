import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Autocomplete, 
  Avatar, 
  Typography, 
  CircularProgress,
  useTheme
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../api/eqApi';

interface User {
  id: number;
  name: string;
  picture?: string;
}

const UserSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const searchUsersDebounced = async () => {
      if (query.length < 2) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchUsers(query);
        console.log('Search results:', results);
        setUsers(results);
      } catch (error) {
        console.error('Lỗi tìm kiếm user:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsersDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleUserSelect = (user: User | null) => {
    if (user) {
      console.log('Navigating to user profile:', user.id);
      navigate(`/user/${user.id}`);
      setQuery('');
      setOpen(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
      <Autocomplete
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        options={users}
        getOptionLabel={(option) => option.name}
        loading={loading}
        value={null}
        onChange={(_, newValue) => handleUserSelect(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Tìm kiếm người dùng..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <Search sx={{ color: 'text.secondary', mr: 1 }} />
              ),
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'background.paper',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              },
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
            <Avatar 
              src={option.picture} 
              alt={option.name} 
              sx={{ width: 32, height: 32, mr: 2 }}
            />
            <Typography variant="body2">{option.name}</Typography>
          </Box>
        )}
        noOptionsText={query.length < 2 ? "Nhập ít nhất 2 ký tự..." : "Không tìm thấy người dùng"}
        sx={{
          '& .MuiAutocomplete-paper': {
            borderRadius: 2,
            boxShadow: theme.shadows[4],
          },
        }}
      />
    </Box>
  );
};

export default UserSearch; 