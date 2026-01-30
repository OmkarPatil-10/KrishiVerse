import { Card } from '../components/ui';

const Admin = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 text-center hover:bg-gray-50 cursor-pointer transition">
                    <h3 className="text-lg font-semibold text-gray-800">Manage Users</h3>
                    <p className="text-3xl font-bold text-primary mt-2">120</p>
                </Card>
                <Card className="p-6 text-center hover:bg-gray-50 cursor-pointer transition">
                    <h3 className="text-lg font-semibold text-gray-800">Total Contracts</h3>
                    <p className="text-3xl font-bold text-primary mt-2">45</p>
                </Card>
                <Card className="p-6 text-center hover:bg-gray-50 cursor-pointer transition">
                    <h3 className="text-lg font-semibold text-gray-800">Market Data</h3>
                    <p className="text-sm text-gray-500 mt-2">Last updated: Today</p>
                </Card>
            </div>

            <Card>
                <div className="p-8 text-center text-gray-500">
                    User Management and Data Import features coming soon.
                </div>
            </Card>
        </div>
    );
};

export default Admin;
