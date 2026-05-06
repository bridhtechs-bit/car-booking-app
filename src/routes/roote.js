import React from 'react'
import { Outlet } from 'react-router-dom'
// Plus besoin de useDispatch ni de restoreAuth ici
import NabBar from '../components/navbar/NavBar.js';

const Roote = () => {
    // Le dispatch de restoreAuth est supprimé car le Slice s'en occupe tout seul au démarrage
    return (
        <>
            <div className="layout">
                <NabBar />
                <Outlet />
            </div>
        </>
    )
}

export default Roote