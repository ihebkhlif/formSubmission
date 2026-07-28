import { Routes } from '@angular/router';

import { Form }
    from './components/form/form';
import { LeaveList } from './components/leave-list/leave-list';




export const routes: Routes = [

    {
        path: '',
        redirectTo: 'request-list',
        pathMatch: 'full'
    },



    {
        path: 'request-list',
        component: LeaveList
    },



    {
        path: 'add',
        component: Form
    },





];