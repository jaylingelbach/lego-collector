export const fetcher = async ([url, token]) => {
    if (!url) return Promise.resolve(null);
  
    const accessToken = token || Cookies.get('accessToken'); 
  
    try {
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
        },
        credentials: 'include',
      });
  
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Fetch error: ${errorData}`);
      }
  
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Network error in fetcher:', error);
      throw error;
    }
  };