<template>
    <section>
        <!--高级查询-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item label="部门名称">
                    <el-input v-model="filters.name" placeholder="服务名称"></el-input>
                </el-form-item>
                <el-form-item label="是否启用">
                    <el-select v-model="filters.state" clearable placeholder="状态">
                        <el-option label="上架" value="1"></el-option>
                        <el-option label="下架" value="0"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getUsers">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                    <el-button type="primary" :disabled="this.sels.length===0" @click="handleOnsale">上架</el-button>
                    <el-button type="primary" :disabled="this.sels.length===0" @click="handleOffsale">下架</el-button>
                </el-form-item>
            </el-form>

        </el-col>
        <!--列表显示-->
        <el-table :data="Products" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection">
            </el-table-column>
            <el-table-column type="index">
            </el-table-column>
            <el-table-column prop="name" label="服务名称" >
            </el-table-column>
            <el-table-column prop="saleprice" label="售价" >
            </el-table-column>
            <el-table-column prop="costprice" label="成本价" >
            </el-table-column>
            <el-table-column prop="onsaletime" label="上架时间" >
            </el-table-column>
            <el-table-column prop="offsaletime" label="下架时间" >
            </el-table-column>
            <el-table-column prop="createtime" label="创建时间" >
            </el-table-column>
            <el-table-column prop="state" label="状态" >
                <template slot-scope="scope">
                    <span style="color: green" v-if="scope.row.state==1">上架</span>
                    <span style="color: red" v-if="scope.row.state==0">下架</span>
                </template>
            </el-table-column>

            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--批量删除-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="pageSize" :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--添加和修改界面-->
        <el-dialog :title="title" :visible.sync="addFormVisible">
            <el-form :model="addForm" width="80px" :rules="addFormRules" ref="addForm">

                <el-form-item label="服务名" prop="name">
                    <el-input v-model="addForm.name" ></el-input>
                </el-form-item>

                <el-form-item label="图片" prop="resources">
                    <el-upload
                            class="upload-demo"
                            action="/api/dfs/upload"
                            :on-remove="handleRemove"
                            :on-success="handleSuccess"
                            :file-list="fileList"
                            list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                </el-form-item>
                <el-form-item label="售价" prop="saleprice">
                    <el-input v-model="addForm.saleprice" ></el-input>
                </el-form-item>
                <el-form-item label="成本价" prop="costprice">
                    <el-input v-model="addForm.costprice" ></el-input>
                </el-form-item>
                <el-form-item label="服务详细" prop="intro">
                    <!--<el-input v-model="addForm.intro" ></el-input>-->
                    <quill-editor :options="editorOption" v-model="addForm.intro">
                    </quill-editor>
                </el-form-item>

                <el-form-item label="预约注意事项" prop="orderNotice">
                    <!--<el-input v-model="addForm.orderNotice" ></el-input>-->
                    <quill-editor :options="editorOption" v-model="addForm.orderNotice">
                    </quill-editor>
                </el-form-item>


            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                 <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>

            </div>
        </el-dialog>
    </section>
</template>
<script>

    import { quillEditor } from "vue-quill-editor"; //调用编辑器
    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';
    import 'quill/dist/quill.bubble.css';
    import quillConfig from "../../common/quill-config"
    export default {
        //申明组件
        components: {
            quillEditor//quillEditor:quillEditor
        },
        data(){
            return{
                editorOption: quillConfig,
                Products:[],//页面数据
                sels:[],//批量删除
                localPage:1, //当前页
                pageSize:5,//每页条数
                total:0,  //总条数
                listLoading:false,
                //高级查询
                filters:{
                    name:'',
                    state:null
                },
                title:'',     //弹出框标题
                addFormVisible:false,//默认不弹出
                addLoading:false, //添加表单加载
                //添加的数据
                addForm:{
                    id:'',
                    name:'',
                    resources: '', //图片
                    saleprice: '',//销售价
                    costprice: '',//成本价
                    salecount: 0, //订单数量
                    intro: '',  //服务详情
                    orderNotice: '' //预约事项
                },
                addFormRules: {  //规则
                    name: [
                        { required: true, message: '请填写部门名称', trigger: 'blur' }
                    ]

                },
                fileList: [], //上传图片的集合
            }
        },
        methods:{
            //批量下架
            handleOffsale(){
                this.$confirm('确认下架吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$http.post("/products/offsale", this.sels).then(res => {
                        let {success, msg} = res.data;
                        if (success) {
                            this.$message({
                                type: 'success',
                                message: '下架成功!'
                            });
                            //重新刷新页面
                            this.loadProducts();
                        } else {
                            this.$message.error(msg);
                        }
                    });
                }).catch(() => {
                });
            },
            //批量上架
            handleOnsale() {
                this.$confirm('确认上架吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$http.post("/products/onsale", this.sels).then(res => {
                        let {success, msg} = res.data;
                        if (success) {
                            this.$message({
                                type: 'success',
                                message: '上架成功!'
                            });
                            //重新刷新页面
                            this.loadProducts();
                        } else {
                            this.$message.error(msg);
                        }
                    });
                }).catch(() => {});
            },
            //先不管，下午说
            handleSuccess(response, file, fileList) {
                //console.log(fileList);
                for(var i=0;i<fileList.length;i++){
                    if(i==0){
                        this.addForm.resources=fileList[i].response.resultObj;
                    }else {
                        this.addForm.resources=this.addForm.resources+fileList[i].response.resultObj;
                    }
                }
                this.addForm.resources = response.resultObj;
            },
            //删除图片
            handleRemove(file, fileList) {
                var filePath = file.response.resultObj;
                this.$http.delete("/dfs/?path=" + filePath)
                    .then(res => {
                        if (res.data.success) {
                            this.$({
                                message: '删除成功!',
                                type: 'success'
                            });
                        } else {
                            this.$message({
                                message: '删除失败!',
                                type: 'error'
                            });
                        }
                    })
            },
            //查询
            getUsers(){
                //给页面赋值第一页
                this.localPage=1;
                this.loadProducts();//调用页面数据加载方法
            },
            //添加
            handleAdd(){
                //判断有没有 如果有就清空
                if(this.$refs["addForm"]){
                    //清空规则
                    this.$refs["addForm"].resetFields();
                }
                this.title='新增';
                //清空表单
                for(var v in this.addForm){
                    this.addForm[v]=''
                }
                //清空图片
                this.fileList=[];
                //弹出添加页面
                this.addFormVisible=true;
            },
            //提交数据
            addSubmit(){
                let productDetail={
                    "intro":this.addForm.intro,
                    "orderNotice" : this.addForm.orderNotice
                };
                this.addForm.productDetail=productDetail;
                //表单的规则
                this.$refs["addForm"].validate((valid) => {
                    //如果符合规则就提交
                    if (valid) {
                        this.$http.put("/products", this.addForm).then(res => {
                            //console.debug(res)
                            let {success, msg} = res.data;
                            if (success) {
                                this.$message({
                                    message: this.title + '成功',
                                    type: 'success'
                                });
                                //关闭弹框
                                this.addFormVisible = false;
                                //重新加载
                                this.loadProducts();
                            }
                        }).catch()
                    } else {
                        //console.log('error submit!!');
                        return false;
                    }
                })


            },
            //编辑
            handleEdit(index,row){
                //console.debug(row);
                //判断有没有规则 如果有就清空
                if(this.$refs["addForm"]){
                    //清空规则
                    this.$refs["addForm"].resetFields();
                }
                this.title='修改';
                //数据回显
                for(let v in this.addForm){
                    this.addForm[v]=row[v];
                }
                //如果服务详情有值，预约须知和详情就进行回显
                if(row.productDetail){
                    this.addForm.intro=row.productDetail.intro;
                    this.addForm.orderNotice=row.productDetail.orderNotice;
                }
                this.fileList = [];
                //附件要进行回显
                if(row.resources){
                    var images = row.resources.split(",");
                    for(var i=0;i<images.length;i++){
                        this.fileList.push({"url":this.$fastBaseUrl+images[i]});
                    }
                }
                //弹出修改框
                this.addFormVisible=true;
            },
            //删除
            handleDel(index,row){
                this.$confirm('确定要删除吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(()=>{  //确定删除
                    this.$http.delete("/products/"+row.id).then((res)=>{
                        let {success,msg} = res.data;
                        if(success){
                            let totalPage = Math.ceil((this.total - 1) / this.pageSize); // 总页数
                            let currentPage = this.localPage > totalPage? totalPage:this.localPage;
                            this.localPage = currentPage<1?1:currentPage;
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            //重新加载列表
                            this.loadProducts();
                        }else {
                            this.$message.error("删除失败");
                        }
                    }).catch()
                }).catch(()=>{  //取消删除
                    this.$message('已取消操作');
                });
            },
            //勾选框
            selsChange(val){
                this.sels=val;
                //console.debug(this.sels);
            },
            //批量删除
            batchRemove(){
                //console.debug(this.sels);
                this.$http.post("/products/batchRemove",this.sels).then((res)=>{
                    //console.debug(res)
                    let {success,msg} = res.data;
                    if(success){
                        let totalPage = Math.ceil((this.total - this.sels.length) / this.pageSize); // 总页数
                        let currentPage = this.localPage > totalPage? totalPage:this.localPage;
                        this.localPage = currentPage<1?1:currentPage;
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                    }else {
                        this.$message.error(msg);
                    }
                    //重新加载列表
                    this.loadProducts();
                }).catch()
            },
            //修改当前页
            handleCurrentChange(val){
                this.localPage=val;
                this.loadProducts();
            },
            //加载列表
            loadProducts(){
                let param = {
                    localPage: this.localPage,
                    pageSize: this.pageSize,
                    name:this.filters.name,  //高级查询的部门名称
                    state:this.filters.state //高级查询的启用
                };
                this.listLoading = true;
                this.$http.post("/products",param).then((res)=>{
                    //console.debug(res);
                    let {data,totals} = res.data;
                    this.Products=data;
                    this.total=totals;
                    this.listLoading = false;
                }).catch()

            }
        },
        mounted(){
            this.loadProducts();
        }
    }
</script>