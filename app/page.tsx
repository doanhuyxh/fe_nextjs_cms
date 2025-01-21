export default async function HomePage() {
    const data_res = await fetch('http://160.30.161.87:9090/get_public/my_project_id');
    const { project } = await data_res.json();
    return (
        <div>
            <style dangerouslySetInnerHTML={{ __html: project.css }} />
            <div dangerouslySetInnerHTML={{ __html: project.html }} />
        </div>
    );
}
