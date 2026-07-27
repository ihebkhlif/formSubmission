import { Routes } from '@angular/router';

import { Form }
    from './components/form/form';
import { LeaveList } from './components/leave-list/leave-list';
import { LeaveRequest } from './components/leave-request/leave-request';




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
        component: LeaveRequest
    },





];