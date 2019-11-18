import { DashboardModule } from '../dashboard';
import { LoginModule } from '../login';

export const modules = [
    new LoginModule(),
    new DashboardModule()
];