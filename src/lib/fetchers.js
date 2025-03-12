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

  export const fetchLegoSets = async (filterValue) => {
    try {
    const response = await fetch(
      `https://rebrickable.com/api/v3/lego/sets/?search=${filterValue}&key=${process.env.NEXT_PUBLIC_REBRICKABLE_API_KEY}`
    );
    const data = await response.json();
    console.log("DATA res FROM API: ", data );
    return data;
  } catch (error) {
    console.error('Error fetching sets:', error);
  }
  }