// src/utils/routeHelper.ts


const pageTitles: Record<string, string> ={
    '/attendance': "Adăugare Pontaj!"
}


/**
 * Returns the page title associated with a given pathname.
 *
 * If the provided pathname does not match any defined page title,
 * the function returns the default title, "Stafy".
 *
 * @param pathname - The route path used to determine the page title.
 * @returns The matching page title for the route, or the default title.
 */
export default function routeHelper(pathname:string){

    return pageTitles[pathname] || 'Stafy';

}