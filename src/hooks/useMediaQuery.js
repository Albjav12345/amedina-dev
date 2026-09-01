import { useEffect, useState } from 'react';

const readQuery = (query) => (
    typeof window !== 'undefined' && window.matchMedia(query).matches
);

const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(() => readQuery(query));

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        const handleChange = (event) => setMatches(event.matches);

        setMatches(mediaQuery.matches);
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
        } else {
            mediaQuery.addListener(handleChange);
        }

        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleChange);
            } else {
                mediaQuery.removeListener(handleChange);
            }
        };
    }, [query]);

    return matches;
};

export default useMediaQuery;
