<template>
    <div class="col-12">
        <div class="list-group">
            <a 
                v-for="item in items" 
                class="list-group-item list-group-item-action" 
                v-bind:class="{'list-group-item-secondary':item.directory, 'text-primary':item.watched}" 
                v-on:click="click(item.directory, item.filename, item.base)"
            >
                {{item.filename}}
            </a>
        </div>
    </div>
</template>
<script>
module.exports = {
    props: ['items', 'f_gfiles', 'go_down', 'go_up'],
    methods: {
        click: function(dir, filename, base) {
            if (dir) {
                if (filename != '..'){
                    this.go_down(base + '/' + filename)
                    this.f_gfiles()
                }else{ //navigate to parent dir
                    this.go_up()
                    this.f_gfiles()
                }
            }else{
                this.play_file(filename, base)
            }
        },
        
        play_file: function(file, base) {
            path = '/play?file=/'+base+'/'+file
            fetch(path)
            .then((response) => {
                if(response.ok) {
                    return response.json()
                }
                throw new Error('Can not play file')
            }).then((json) => {
                if(!json.success) {
                    throw new Error('The launch of the video failed')
                }
            }).catch((err) => {
                console.log(err)
            })
        }
    }
}
</script>
